/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: 'groups',
    type: 'base',
    system: false,
    schema: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 255
        }
      }
    ],
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null
  });

  // Override autogenerate pattern to allow custom IDs
  const idField = collection.fields.find(f => f.name === 'id');
  if (idField && idField.options) {
    idField.options.autogeneratePattern = '';
  }

  return app.dao().saveCollection(collection);
}, (app) => {
  const collection = app.dao().findCollectionByNameOrId('groups');
  return app.dao().deleteCollection(collection);
});
