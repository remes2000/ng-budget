/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let settings = app.settings()
  settings.batch.enabled = true;
  settings.batch.maxRequests = 150;
  settings.batch.timeout = 3;

  app.save(settings);
}, (app) => {
  let settings = app.settings()
  settings.batch.enabled = false;
  settings.batch.maxRequests = 50;
  settings.batch.timeout = 3;

  app.save(settings);
})
