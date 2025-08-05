
use lofty::config::WriteOptions;
use lofty::read_from_path;
use lofty::{file::TaggedFileExt, probe::Probe};
use lofty::tag::{Accessor, Tag, TagExt};
use lofty::picture::{Picture};
use log::info;
use serde::{Deserialize, Serialize};
use tauri::{self, Emitter};
use std::fs::{File};
use std::path::Path;
use std::io::{BufReader};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Song {
  id: String,
  src: String,
  path: String,
  name: String,
  title: String,
  artist: String,
  album: String,
  year: u32,
  artwork_file_path: String
}

#[tauri::command]
pub async fn write_metadata(song: Song, app_handle: tauri::AppHandle) {
  info!("{:?}", song);

  let cloned = song.clone();
  let probe =  match Probe::open(&cloned.path).unwrap().guess_file_type() {
    Ok(res)=>res,
    Err(_) => todo!(),
      };
  let file_type = &probe.file_type();
  info!("file_type {:?}", &file_type);

	let mut tagged_file = probe
		.read()
		.expect("ERROR: Failed to read file!");

	let tag = match tagged_file.primary_tag_mut() {
		Some(primary_tag) => primary_tag,
		None => {
			if let Some(first_tag) = tagged_file.first_tag_mut() {
				first_tag
			} else {
				let tag_type = tagged_file.primary_tag_type();

				eprintln!("WARN: No tags found, creating a new tag of type `{tag_type:?}`");
				tagged_file.insert_tag(Tag::new(tag_type));

				tagged_file.primary_tag_mut().unwrap()
			}
		},
	};

  tag.set_title(cloned.title);
  tag.set_artist(cloned.artist);
  tag.set_album(cloned.album);
  if cloned.year != 0 {
    tag.set_year(cloned.year);
  }

  if !cloned.artwork_file_path.is_empty() {
    let picture_file = File::options()
    .read(true)
    .write(true)
    .open(&Path::new(&cloned.artwork_file_path)).unwrap();

    let mut reader = BufReader::new(picture_file);
    let pic = Picture::from_reader(reader.get_mut());
    tag.set_picture(0, pic.unwrap());
  }

  tag.save_to_path(cloned.path, WriteOptions::default())
		.expect("ERROR: Failed to write the tag!");

  // tag.set_picture(0, picture);
  let _ =app_handle.emit("update_song_metadata", song);
}


#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ArtworkRequest {
    path: String
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Artwork {
    pub data: Vec<u8>,
    format: String,
}

#[tauri::command]
pub async fn get_artwork_metadata(request: ArtworkRequest) -> Option<Artwork>  {
      let file_path = Path::new(&request.path);

    if file_path.is_file() {
        match read_from_path(&file_path) {
            Ok(tagged_file) => {
                if tagged_file.primary_tag().is_some() {
                    if let Some(pic) = tagged_file.primary_tag().unwrap().pictures().first() {
                        let mut format = String::new();

                        if let Some(mime) = pic.mime_type() {
                            format = mime.to_string();
                        }

                        return Some(Artwork {
                            data: pic.data().to_vec(),
                            format,
                        });
                    }
                }
            }
            Err(e) => {
                info!("Error reading file: {}", e);
                return None;
            }
        }
    }

    None
}