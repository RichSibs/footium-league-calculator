// Import the league structure and functions from script.js
const leagueStructure = {
    1: 1,    // Division 1: 1 league (12 clubs)
    2: 2,    // Division 2: 2 leagues (24 clubs)
    3: 4,    // Division 3: 4 leagues (48 clubs)
    4: 8,    // Division 4: 8 leagues
    5: 16,   // Division 5: 16 leagues
    6: 32,   // Division 6: 32 leagues
    7: 64,   // Division 7: 64 leagues
    8: 128   // Division 8: 128 leagues (1536 clubs)
};

// Function to calculate which league a team will be promoted to
function getPromotedLeague(currentDivision, currentLeague) {
    return Math.ceil(currentLeague / 2);
}

// Function to calculate if teams will meet in the same league when promoted
function willMeetInSameDivision(leagueA, leagueB) {
    return Math.ceil(leagueA / 2) === Math.ceil(leagueB / 2);
}

// Function to calculate convergence
function calculateConvergence(divA, leagueA, divB, leagueB) {
    if (divA === divB && leagueA === leagueB) {
        return { division: divA, league: leagueA, seasons: 0 };
    }

    let currentDivA = divA;
    let currentLeagueA = leagueA;
    let currentDivB = divB;
    let currentLeagueB = leagueB;
    let seasons = 0;

    while (currentDivA !== currentDivB || currentLeagueA !== currentLeagueB) {
        let promotedThisSeason = false;

        if (currentDivA === currentDivB) {
            if (willMeetInSameDivision(currentLeagueA, currentLeagueB)) {
                if (currentDivA > 1) {
                    currentDivA--;
                    currentDivB--;
                    currentLeagueA = getPromotedLeague(currentDivA + 1, currentLeagueA);
                    currentLeagueB = currentLeagueA;
                    promotedThisSeason = true;
                } else {
                    currentLeagueA = 1;
                    currentLeagueB = 1;
                }
            }
        } else {
            if (currentDivA > 1 && currentDivA > currentDivB) {
                currentDivA--;
                currentLeagueA = getPromotedLeague(currentDivA + 1, currentLeagueA);
                promotedThisSeason = true;
            }
            if (currentDivB > 1 && currentDivB > currentDivA) {
                currentDivB--;
                currentLeagueB = getPromotedLeague(currentDivB + 1, currentLeagueB);
                promotedThisSeason = true;
            }
        }

        if (promotedThisSeason) {
            seasons++;
        }

        if (currentDivA === 1 && currentDivB === 1) {
            currentLeagueA = 1;
            currentLeagueB = 1;
        }
    }

    return { division: currentDivA, league: currentLeagueA, seasons: seasons };
}

// Function to validate a test case
function validateTestCase(testCase, result) {
    const { divA, leagueA, divB, leagueB, expectedDiv, expectedLeague, expectedSeasons } = testCase;
    const isValid = result.division === expectedDiv && 
                   result.league === expectedLeague && 
                   result.seasons === expectedSeasons;
    
    console.log(`Test Case: Team A (Div ${divA}, League ${leagueA}) vs Team B (Div ${divB}, League ${leagueB})`);
    console.log(`Expected: Division ${expectedDiv}, League ${expectedLeague}, Seasons ${expectedSeasons}`);
    console.log(`Got     : Division ${result.division}, League ${result.league}, Seasons ${result.seasons}`);
    console.log(`Result  : ${isValid ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log('-------------------');
    return isValid;
}

// Known test cases
const knownTestCases = [
    // Same division, adjacent leagues
    {
        divA: 3, leagueA: 1,
        divB: 3, leagueB: 2,
        expectedDiv: 2, expectedLeague: 1, expectedSeasons: 1,
        description: "Same division, adjacent leagues (should promote together)"
    },
    // Same division, non-adjacent leagues
    {
        divA: 3, leagueA: 1,
        divB: 3, leagueB: 3,
        expectedDiv: 2, expectedLeague: 2, expectedSeasons: 1,
        description: "Same division, non-adjacent leagues (should promote to different leagues)"
    },
    // Different divisions
    {
        divA: 4, leagueA: 1,
        divB: 3, leagueB: 1,
        expectedDiv: 2, expectedLeague: 1, expectedSeasons: 2,
        description: "Different divisions, same relative league position"
    },
    // Complex case
    {
        divA: 5, leagueA: 1,
        divB: 3, leagueB: 4,
        expectedDiv: 1, expectedLeague: 1, expectedSeasons: 4,
        description: "Complex case with multiple promotions"
    }
];

// Function to generate a random test case
function generateRandomTestCase() {
    const divA = Math.floor(Math.random() * 8) + 1;
    const divB = Math.floor(Math.random() * 8) + 1;
    const leagueA = Math.floor(Math.random() * leagueStructure[divA]) + 1;
    const leagueB = Math.floor(Math.random() * leagueStructure[divB]) + 1;
    return { divA, leagueA, divB, leagueB };
}

// Function to verify a random test case result
function verifyRandomTestCase(testCase, result) {
    const { divA, leagueA, divB, leagueB } = testCase;
    
    // Verification rules:
    // 1. Result division should be <= min(divA, divB)
    // 2. Result league should be <= number of leagues in result division
    // 3. Seasons should be >= difference in divisions
    // 4. If in Division 1, must be League 1
    
    const isValid = (
        result.division <= Math.min(divA, divB) &&
        result.league <= leagueStructure[result.division] &&
        result.seasons >= Math.abs(divA - divB) &&
        (result.division === 1 ? result.league === 1 : true)
    );

    console.log(`Random Test: Team A (Div ${divA}, League ${leagueA}) vs Team B (Div ${divB}, League ${leagueB})`);
    console.log(`Result: Division ${result.division}, League ${result.league}, Seasons ${result.seasons}`);
    console.log(`Validation: ${isValid ? 'PASS ✅' : 'FAIL ❌'}`);
    if (!isValid) {
        console.log('Failed validation rules:');
        if (result.division > Math.min(divA, divB)) console.log('- Result division is too high');
        if (result.league > leagueStructure[result.division]) console.log('- Invalid league number for division');
        if (result.seasons < Math.abs(divA - divB)) console.log('- Too few seasons for division difference');
        if (result.division === 1 && result.league !== 1) console.log('- Division 1 must be League 1');
    }
    console.log('-------------------');
    return isValid;
}

// Run tests
console.log('Running known test cases...');
const knownTestResults = knownTestCases.map(testCase => {
    const result = calculateConvergence(testCase.divA, testCase.leagueA, testCase.divB, testCase.leagueB);
    return validateTestCase(testCase, result);
});

console.log('\nRunning random test cases...');
const numRandomTests = 10;
const randomTestResults = Array(numRandomTests).fill().map(() => {
    const testCase = generateRandomTestCase();
    const result = calculateConvergence(testCase.divA, testCase.leagueA, testCase.divB, testCase.leagueB);
    return verifyRandomTestCase(testCase, result);
});

// Report results
console.log('\nTest Results Summary:');
console.log(`Known Tests: ${knownTestResults.filter(x => x).length}/${knownTestResults.length} passed`);
console.log(`Random Tests: ${randomTestResults.filter(x => x).length}/${randomTestResults.length} passed`); 