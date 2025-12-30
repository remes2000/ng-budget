/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  app.db()
    .newQuery('CREATE UNIQUE INDEX `unique_budget_each_month` ON `category_budgets` (`month`, `year`, `category`)')
    .execute();
}, (app) => {
  app.db().newQuery('DROP INDEX `unique_budget_each_month`').execute();
})