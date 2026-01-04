/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: 'categories',
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
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['income', 'expense']
        }
      },
      {
        name: 'groupId',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 255
        }
      },
      {
        name: 'defaultBudget',
        type: 'number',
        required: false,
        options: {
          min: 0,
          noDecimal: true
        }
      }
    ],
    indexes: [
      'CREATE INDEX idx_categories_groupId ON categories (groupId)',
      'CREATE INDEX idx_categories_type ON categories (type)'
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
  const collection = app.dao().findCollectionByNameOrId('categories');
  return app.dao().deleteCollection(collection);
});
