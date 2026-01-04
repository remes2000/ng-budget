/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    type: 'base',
    name: 'categories',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        values: [
          'income',
          'expense'
        ],
        maxSelect: 1
      },
      {
        name: 'groupId',
        type: 'text',
        required: true
      },
      {
        name: 'defaultBudget',
        type: 'number',
        required: false,
        onlyInt: true,
        min: 0
      },
      {
        name: 'createdAt',
        type: 'autodate',
        onCreate: true,
        onUpdate: false
      },
      {
        name: 'updatedAt',
        type: 'autodate',
        onCreate: false,
        onUpdate: true
      }
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('categories');
  app.delete(collection);
});
