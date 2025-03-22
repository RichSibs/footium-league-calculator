// League structure configuration
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

// Function to calculate which league a team will be promoted to
function getPromotedLeague(currentDivision, currentLeague) {
    // When promoting, teams go to the league number that corresponds to their current league's position
    // For example: League 1 and 2 from Div 3 go to League 1 in Div 2
    //             League 3 and 4 from Div 3 go to League 2 in Div 2
    return Math.ceil(currentLeague / 2);
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
        // Team A promotion (if not in Division 1)
        if (currentDivA > 1) {
            // Promote to the division above
            currentDivA--;
            currentLeagueA = getPromotedLeague(currentDivA + 1, currentLeagueA);
        }

        // Team B promotion (if not in Division 1)
        if (currentDivB > 1) {
            // Promote to the division above
            currentDivB--;
            currentLeagueB = getPromotedLeague(currentDivB + 1, currentLeagueB);
        }

        // If both teams are in the same division but different leagues
        if (currentDivA === currentDivB && currentLeagueA !== currentLeagueB) {
            // In the same division, teams will only meet if they get promoted to the same league
            // We need to find the common league they'll end up in when promoted
            const commonLeague = Math.min(currentLeagueA, currentLeagueB);
            currentLeagueA = commonLeague;
            currentLeagueB = commonLeague;
        }

        seasons++;
        console.log(`Season ${seasons}:`, {
            teamA: { division: currentDivA, league: currentLeagueA },
            teamB: { division: currentDivB, league: currentLeagueB }
        });

        // If both teams reach Division 1, they must converge in League 1
        if (currentDivA === 1 && currentDivB === 1) {
            currentLeagueA = 1;
            currentLeagueB = 1;
        }
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