use tauri_plugin_sql::{Migration, MigrationKind};
use tauri::{AppHandle, Manager}; 

mod metadata;

#[tauri::command]
async fn open_audio_player_window(app: AppHandle) {
     if app.get_webview_window("audio-player").is_none() {
        let _new_window = tauri::WebviewWindowBuilder::new(&app, "audio-player", tauri::WebviewUrl::App("/index.html".into()))
            .title("audio-player | musicuon")
            .inner_size(360.0, 444.0)
            .disable_drag_drop_handler()
            .resizable(false)
            .fullscreen(false)
            .build()
            .unwrap();
     };

}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let migrations = vec![
      // Define your migrations here
      Migration {
          version: 1,
          description: "create_initial_tables",
          sql: "CREATE TABLE songs (id INTEGER PRIMARY KEY, value TEXT);",
          kind: MigrationKind::Up,
      }
  ];

  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_sql::Builder::default()
              .add_migrations("sqlite:musicuon.db", migrations)
              .build()
    )
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      open_audio_player_window, metadata::write_metadata
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
