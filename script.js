// League structure configuration
const leagueStructure = {
    1: 1,    // Division 1: 1 league
    2: 2,    // Division 2: 2 leagues
    3: 4,    // Division 3: 4 leagues
    4: 8,    // Division 4: 8 leagues
    5: 16,   // Division 5: 16 leagues
    6: 32,   // Division 6: 32 leagues
    7: 64,   // Division 7: 64 leagues
    8: 128   // Division 8: 128 leagues
};

// Function to show error message
function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = `Error: ${message}`;
    resultDiv.style.backgroundColor = '#f8d7da';
    resultDiv.style.color = '#721c24';
}

// Function to show success message
function showSuccess(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
    resultDiv.style.backgroundColor = '#e8f4f8';
    resultDiv.style.color = '#2c3e50';
}

// Function to calculate which league a team will be in after promotion
function getPromotedLeague(currentLeague) {
    return Math.ceil(currentLeague / 2);
}

// Function to calculate which league a team will be in after relegation
function getRelegatedLeague(currentLeague) {
    return (currentLeague - 1) * 2 + 1;
}

// Function to calculate convergence
function calculateConvergence(divA, leagueA, divB, leagueB) {
    console.log('Calculating convergence for:', { divA, leagueA, divB, leagueB });
    
    // If teams are in the same division and league, they're already together
    if (divA === divB && leagueA === leagueB) {
        return {
            division: divA,
            league: leagueA,
            seasons: 0
        };
    }

    let currentDivA = divA;
    let currentLeagueA = leagueA;
    let currentDivB = divB;
    let currentLeagueB = leagueB;
    let seasons = 0;

    // Keep calculating until teams converge
    while (currentDivA !== currentDivB || currentLeagueA !== currentLeagueB) {
        // Team A promotion/relegation
        if (currentDivA > currentDivB) {
            // Team A needs to be promoted
            currentDivA--;
            currentLeagueA = getPromotedLeague(currentLeagueA);
        } else if (currentDivA < currentDivB) {
            // Team A needs to be relegated
            currentDivA++;
            currentLeagueA = getRelegatedLeague(currentLeagueA);
        }

        // Team B promotion/relegation
        if (currentDivB > currentDivA) {
            // Team B needs to be promoted
            currentDivB--;
            currentLeagueB = getPromotedLeague(currentLeagueB);
        } else if (currentDivB < currentDivA) {
            // Team B needs to be relegated
            currentDivB++;
            currentLeagueB = getRelegatedLeague(currentLeagueB);
        }

        // If teams are in the same division but different leagues, they need to merge
        if (currentDivA === currentDivB && currentLeagueA !== currentLeagueB) {
            // Teams will merge into the lower league number
            currentLeagueA = Math.min(currentLeagueA, currentLeagueB);
            currentLeagueB = currentLeagueA;
        }

        seasons++;
        console.log(`Season ${seasons}:`, {
            teamA: { division: currentDivA, league: currentLeagueA },
            teamB: { division: currentDivB, league: currentLeagueB }
        });
    }

    return {
        division: currentDivA,
        league: currentLeagueA,
        seasons: seasons
    };
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // DOM Elements
    const teamADivision = document.getElementById('teamA-division');
    const teamALeague = document.getElementById('teamA-league');
    const teamBDivision = document.getElementById('teamB-division');
    const teamBLeague = document.getElementById('teamB-league');
    const calculateButton = document.getElementById('calculate');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    // Check if all required elements are present
    if (!teamADivision || !teamALeague || !teamBDivision || !teamBLeague || !calculateButton || !resultDiv || !loadingDiv) {
        showError('Failed to initialize calculator. Please refresh the page.');
        return;
    }

    // Function to update league options based on division
    function updateLeagueOptions(divisionSelect, leagueSelect) {
        const division = parseInt(divisionSelect.value);
        const numLeagues = leagueStructure[division];
        
        if (!numLeagues) {
            console.error('Invalid division:', division);
            return;
        }
        
        // Clear existing options
        leagueSelect.innerHTML = '';
        
        // Add new options
        for (let i = 1; i <= numLeagues; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `League ${i}`;
            leagueSelect.appendChild(option);
        }
    }

    // Event Listeners
    teamADivision.addEventListener('change', () => {
        console.log('Team A division changed');
        updateLeagueOptions(teamADivision, teamALeague);
    });
    
    teamBDivision.addEventListener('change', () => {
        console.log('Team B division changed');
        updateLeagueOptions(teamBDivision, teamBLeague);
    });

    calculateButton.addEventListener('click', () => {
        console.log('Calculate button clicked');
        try {
            const divA = parseInt(teamADivision.value);
            const leagueA = parseInt(teamALeague.value);
            const divB = parseInt(teamBDivision.value);
            const leagueB = parseInt(teamBLeague.value);

            console.log('Input values:', { divA, leagueA, divB, leagueB });

            const result = calculateConvergence(divA, leagueA, divB, leagueB);
            console.log('Calculation result:', result);
            
            if (result.seasons === 0) {
                showSuccess('Teams are already in the same league!');
            } else {
                showSuccess(`Teams will converge in Division ${result.division} - League ${result.league} after ${result.seasons} season${result.seasons > 1 ? 's' : ''}.`);
            }
        } catch (error) {
            console.error('Calculation error:', error);
            showError(error.message);
        }
    });

    // Initialize league options
    console.log('Initializing league options...');
    updateLeagueOptions(teamADivision, teamALeague);
    updateLeagueOptions(teamBDivision, teamBLeague);

    // Hide loading indicator
    loadingDiv.classList.add('hidden');
}); 