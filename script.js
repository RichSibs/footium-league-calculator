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
    // In Footium, teams from leagues 1-2 go to league 1
    // Teams from leagues 3-4 go to league 2, etc.
    return Math.ceil(currentLeague / 2);
}

// Function to check if teams can meet in the same league
function canTeamsMeet(divA, leagueA, divB, leagueB) {
    // If teams are in the same division
    if (divA === divB) {
        // They can meet if they're in the same league or can be promoted to the same league
        return leagueA === leagueB || Math.ceil(leagueA / 2) === Math.ceil(leagueB / 2);
    }
    return false;
}

// Function to find all possible promotion paths
function findConvergencePaths(divA, leagueA, divB, leagueB, maxSeasons = 10) {
    // State includes: divA, leagueA, divB, leagueB, seasons
    let initialState = {
        divA, leagueA, divB, leagueB,
        seasons: 0,
        path: []
    };
    
    let queue = [initialState];
    let bestResult = null;

    while (queue.length > 0) {
        let current = queue.shift();
        
        // Check if teams have converged
        if (canTeamsMeet(current.divA, current.leagueA, current.divB, current.leagueB)) {
            if (bestResult === null || current.seasons < bestResult.seasons) {
                bestResult = {
                    division: current.divA,
                    league: Math.min(current.leagueA, current.leagueB),
                    seasons: current.seasons,
                    path: current.path
                };
            }
            continue;
        }

        // Don't explore paths longer than our current best or maxSeasons
        if (current.seasons >= maxSeasons || 
            (bestResult !== null && current.seasons >= bestResult.seasons)) {
            continue;
        }

        // Try all possible promotion combinations for next season
        
        // Option 1: Only Team A promotes
        if (current.divA > 1) {
            queue.push({
                divA: current.divA - 1,
                leagueA: getPromotedLeague(current.divA, current.leagueA),
                divB: current.divB,
                leagueB: current.leagueB,
                seasons: current.seasons + 1,
                path: [...current.path, 'A']
            });
        }

        // Option 2: Only Team B promotes
        if (current.divB > 1) {
            queue.push({
                divA: current.divA,
                leagueA: current.leagueA,
                divB: current.divB - 1,
                leagueB: getPromotedLeague(current.divB, current.leagueB),
                seasons: current.seasons + 1,
                path: [...current.path, 'B']
            });
        }

        // Option 3: Both teams promote
        if (current.divA > 1 && current.divB > 1) {
            queue.push({
                divA: current.divA - 1,
                leagueA: getPromotedLeague(current.divA, current.leagueA),
                divB: current.divB - 1,
                leagueB: getPromotedLeague(current.divB, current.leagueB),
                seasons: current.seasons + 1,
                path: [...current.path, 'AB']
            });
        }
    }

    return bestResult;
}

// Function to describe the convergence path
function describeConvergencePath(path) {
    if (!path || path.length === 0) return "";
    
    let description = "\n\nPath to convergence:\n";
    path.forEach((step, index) => {
        description += `Season ${index + 1}: `;
        if (step === 'A') description += "Team A promotes";
        else if (step === 'B') description += "Team B promotes";
        else if (step === 'AB') description += "Both teams promote";
        description += "\n";
    });
    return description;
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

            // If teams are already in the same division and league or can promote to same league
            if (canTeamsMeet(divA, leagueA, divB, leagueB)) {
                if (divA === divB && leagueA === leagueB) {
                    showSuccess('Teams are already in the same league!');
                } else {
                    showSuccess(`Teams can meet next season in Division ${divA - 1}, League ${Math.ceil(Math.min(leagueA, leagueB) / 2)} after 1 season.`);
                }
                return;
            }

            const result = findConvergencePaths(divA, leagueA, divB, leagueB);
            console.log('Calculation result:', result);
            
            if (result) {
                let message = `Teams can first meet in Division ${result.division}, League ${result.league} after ${result.seasons} season${result.seasons > 1 ? 's' : ''}.`;
                message += describeConvergencePath(result.path);
                showSuccess(message);
            } else {
                showError('Could not find a convergence path within 10 seasons.');
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