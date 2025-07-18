
use lofty::config::WriteOptions;
use lofty::{file::TaggedFileExt, probe::Probe};
use lofty::tag::{Accessor, Tag, TagExt};
use log::info;
use serde::{Deserialize, Serialize};
use tauri::{self, Emitter};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Song {
  id: String,
  src: String,
  path: String,
  name: String,
  title: String,
  artist: String,
  album: String,
  year: u32
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
  tag.set_year(cloned.year);

  tag.save_to_path(cloned.path, WriteOptions::default())
		.expect("ERROR: Failed to write the tag!");

  let _ =app_handle.emit("update_song_metadata", song);
}