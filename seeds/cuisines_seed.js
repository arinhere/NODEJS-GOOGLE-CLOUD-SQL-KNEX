
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('cuisines').del()
    .then(function () {
      // Inserts seed entries
      return knex('cuisines').insert([
        { id: 1, cuisine: 'Italian' },
        { id: 2, cuisine: 'Pizza' },
        { id: 3, cuisine: 'Indian' },
        { id: 4, cuisine: 'Burgers' },
        { id: 5, cuisine: 'Japanese' },
        { id: 6, cuisine: 'Chicken' },
        { id: 7, cuisine: 'Soup' }
      ]);
    });
};
