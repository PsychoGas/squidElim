const { db } = require('./lib/db/index');
const { players } = require('./lib/db/schema');

const dummyNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve',
  'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'
];

const dummyAvatars = [
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/women/5.jpg',
  'https://randomuser.me/api/portraits/men/6.jpg',
  'https://randomuser.me/api/portraits/women/7.jpg',
  'https://randomuser.me/api/portraits/men/8.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
];

async function seedPlayers() {
  for (let i = 0; i < 10; i++) {
    await db.insert(players).values({
      name: dummyNames[i],
      avatar: dummyAvatars[i],
      isEliminated: false,
      // playerNumber, createdAt, updatedAt are auto-generated
    });
  }
  console.log('Seeded 10 dummy players!');
  process.exit(0);
}

seedPlayers().catch((err) => {
  console.error(err);
  process.exit(1);
}); 