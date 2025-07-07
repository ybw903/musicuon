use tauri_plugin_sql::{Migration, MigrationKind};
use tauri::{AppHandle, Manager};

#[tauri::command]
async fn open_play_list_window(app: AppHandle) {
     if app.get_webview_window("play-list").is_none() {
        // TODO: add env condition
        let _new_window = tauri::WebviewWindowBuilder::new(&app, "play-list", tauri::WebviewUrl::App("http://localhost:5173/play-list/index.html".into()))
            .title("play-list | musicuon")
            .inner_size(400.0, 600.0)
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
          sql: "CREATE TABLE songs (id INTEGER PRIMARY KEY, path TEXT);",
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
    .invoke_handler(tauri::generate_handler![open_play_list_window])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
