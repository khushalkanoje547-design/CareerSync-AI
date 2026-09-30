// backend/test-matcher.js
// Run with: node test-matcher.js
// Calls the real matcher service with fake data so we can see the FULL
// error (including err.cause) instead of the generic "fetch failed".

require('dotenv').config();
const { matchOpportunities } = require('./services/matcher');

const fakeStudent = {
  branch: 'Computer Science',
  year: 2,
  category: 'General',
  skills: ['React', 'Python'],
  location: 'Aurangabad'
};

const fakeOpportunities = [
  {
    _id: { toString: () => 'test-opp-1' },
    title: 'Test Scholarship',
    type: 'scholarship',
    eligibleBranches: ['any'],
    eligibleYears: [1, 2],
    eligibleCategories: ['any'],
    location: 'any',
    description: 'A test scholarship for debugging.'
  }
];

matchOpportunities(fakeStudent, fakeOpportunities)
  .then(result => {
    console.log('SUCCESS:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error('FULL ERROR MESSAGE:', err.message);
    console.error('ERROR CAUSE:', err.cause);
    console.error('FULL ERROR OBJECT:', err);
  });
  