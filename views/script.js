//TODO: figure out sport mapping, work on location, figure out post requests


const token = localStorage.getItem('authToken');

let loclist = [[]];

var sport_lists =  new Map();
sport_lists.set("tennis", ['BV', 'BJV', 'GV', 'GJV', 'Rec']);
sport_lists.set("lacrosse", ['BV', 'BJV', 'GV', 'GJV']);
sport_lists.set("baseball", ['Varsity', 'JV']);
sport_lists.set("softball", ['Varsity', 'JV']);
sport_lists.set("golf", ['Varsity', 'JV']);
sport_lists.set("crew", ['Girls', 'Boys']);
sport_lists.set("yoga", ['Yoga']);
sport_lists.set("fit", ['FIT']);
sport_lists.set("sc", ['S&C']);
sport_lists.set("dance", ['Dance']);

var autolist = [[]];

var storage = new Map();
var current = '';
const regex = /([^0-9]+)?(\d+:\d+\s?[APMapm]+)?(\d+:\d+\s?[APMapm]+)?/;
let selection = document.getElementById('sport');
selection.addEventListener("change", request, false);
var csv = ["TeamName", "Date", "Start Time", "End Time", "Location"];

async function get() {
    if (!token) {
        alert('No authentication token found. Please log in first.');
        return;
    }
    try {
        const response = await fetch('https://hub-dev.stmarksschool.org/v1/group?season=SPRING&type=ATHLETIC_TEAM', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        var sports = await response.json();
        const sportIds = sports.map(group => group.id);
        autolist[0] = sportIds;
        const sportNames = sports.map(group => group.name);
        autolist[1] = sportNames;
        
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
    try {
        const response = await fetch('https://hub-dev.stmarksschool.org/v1/location', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        var locations = await response.json();
        const locIds = locations.map(group => group.id);
        loclist[0] = locIds;
        const locNames = locations.map(group => group.roomName);
        loclist[1] = locNames;
        
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }

}

function request() {
    if (current == '')
        current = selection.value;
    save();
    displaySport();
}

function decodeRegex(data, param) {
    if(data) {
        const regexData = regex.exec(data);
        if (param == 'location') 
            return regexData[1] ? regexData[1].trim() : '';
        if (param =='start')
            return regexData[2] ? regexData[2].trim() : '';
        if (param =='end') 
            return regexData[3] ? regexData[3].trim() : '';
    }
}

function displaySport() {
    current = selection.value;
    var sport = selection.value;
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML='';
    for (let week = 0; week < sport_lists.get(sport).length; week++) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.innerHTML += sport_lists.get(sport)[week];
        row.appendChild(cell);
        var existing = false;
        if (storage.has(sport) && storage.get(sport).has(sport_lists.get(sport)[week]))
            existing = true;
        if (existing)
            repopulate = storage.get(sport).get(sport_lists.get(sport)[week]);
        for (let day = 0; day < 6; day++) {
            const cell = document.createElement('td');
            const start = document.createElement('input');
            const end = document.createElement('input');
            start.type = "time";     
            end.type = "time";
            const location = document.createElement('select');
            const option = document.createElement('option');
            option.disabled = true;
            option.value = '';
            option.text = "Select an option: ";
            option.selected = true;
            var selectedLoc = '';
            if (existing) {
                var startval = decodeRegex(repopulate[day], 'start');
                if(startval != undefined && startval != '') {
                    start.defaultValue = reverseTime(startval);
                }
                var endval = decodeRegex(repopulate[day], 'end');
                if(endval != undefined && endval != '') {
                    end.defaultValue = reverseTime(endval);
                }
                var selectedLoc = decodeRegex(repopulate[day], 'location');
            }
            location.appendChild(option);
            for (var i = 0; i < loclist[0].length; i++) {
                const option = document.createElement('option');
                option.value = loclist[0][i];
                option.text = loclist[1][i];
                if (selectedLoc != undefined && option.text == selectedLoc) {
                    option.selected = true;
                }
                location.appendChild(option);
            }
            const game = document.createElement('input');
            game.type = "checkbox";
            cell.innerHTML += "Start: ";
            cell.appendChild(start);
            cell.innerHTML += "<br>End: ";
            cell.appendChild(end);
            cell.innerHTML += "<br>Loc: ";
            cell.appendChild(location);
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
}

//add post request

function send() {
    save();
    cycle();
    // for (var sport of storage.keys()) {
    //     storage.get(sport).forEach((teamData, team) => {
    //         for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
    //             if (teamData) {
    //                 const regexData = regex.exec(teamData[dayIndex]);
    //                 const location = regexData[1] ? regexData[1].trim() : '';
    //                 const start = regexData[2] ? regexData[2].trim() : '';
    //                 const end = regexData[3] ? regexData[3].trim() : '';

    //                 var temparr = [];
    //                 temparr[0] = formatTeam(sport, team);
            
    //                 var currDate = new Date();
    //                 var date = new Date(currDate);
    //                 var sunday = currDate.getDay() - 0;
    //                 date.setDate(currDate.getDate() - sunday + dayIndex + 1);
    //                 var day = formatDate(date);
    //                 temparr[1] = day;
    //                 temparr[2] = start;
    //                 temparr[3] = end;
    //                 temparr[4] = location;
    //                 toCSV(temparr);
    //             }
    //         }
    //     });
    // }
}

function cycle() {
    sport = selection.value;
    var table = document.getElementById("calendarBody");
    for (var i = 0, row; row = table.rows[i]; i++) {
        var rawTeam = sport_lists.get(sport)[i];
        var teamId = toAuto(sport, rawTeam);
        for (var j = 1, col; col = row.cells[j]; j++) {
            var temparr = [];
            temparr[0] = teamId;
            
            var currDate = new Date();
            var date = new Date(currDate);
            var sunday = currDate.getDay() - 0;
            date.setDate(currDate.getDate() - sunday + j);

            var locSelect = col.getElementsByTagName("select")[0];
            if(locSelect.options[locSelect.selectedIndex].value != '')
                temparr[3] = ((locSelect.options[locSelect.selectedIndex].value));
            else temparr[3] = " ";

            var startTime = col.getElementsByTagName("input")[0]; 
            if (startTime.value != '')
                temparr[1] = formatISO(date, startTime.value);
            else temparr[1] = " ";

            var endTime = col.getElementsByTagName("input")[1]; 
            if (endTime.value != '') 
                temparr[2] = formatISO(date, endTime.value);
                else temparr[2] = " ";
            toCSV(temparr);
            post(temparr);
        }
    }
    downloadCSV(csv);
}

async function post(event) {
    if (!token) {
        alert('No authentication token found. Please log in first.');
        return;
    }
    try {
        const response = await fetch('https://hub-dev.stmarksschool.org/v1/group/event', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                groupId: event[0],
                eventType: 'PRACTICE',
                locationId: event[3],
                startTime: event[1],
                endTime: event[2],
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        // const statusCode = response.status;
        // console.log('Status code:', statusCode);
        // const responseBody = await response.json();
        // console.log('Response body:', responseBody);
        
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

function preview() {
    // time for pseudocode thinking
    // TODO: i need to figure out handling null values
    // How to make the display with the data - do i add an overlay class
    var existing = document.querySelector('.modal-overlay');
    if (existing) 
        return
    var sport = selection.value;
    var data = getData(sport);
    const table = document.createElement('table');
    table.setAttribute('id', 'preview-table');

    const nameRow = table.createTHead().insertRow(0);
    const sportName = document.createElement('td'); 
    sportName.className = "title";
    sportName.innerHTML = formatSport(sport).toUpperCase();
    sportName.colSpan = 7; // Span the entire row
    nameRow.append(sportName);
    const headerRow = table.createTHead().insertRow(1); 
    const teamHeader = document.createElement('th'); 
    teamHeader.innerHTML = '<b>TEAM</b>';
    headerRow.appendChild(teamHeader);
    
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    for (var i = 0; i < days.length; i++) {
        const dayHeader = document.createElement('th');
        dayHeader.innerHTML = `<b>${days[i]}</b>`;
        headerRow.appendChild(dayHeader);
    }

    sport_lists.get(sport).forEach((team, index) => {
        const row = table.insertRow(index + 2);
        const teamCell = row.insertCell(0);
        teamCell.textContent = team;

        for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
            const cell = row.insertCell(dayIndex + 1);
            const eventData = data.get(team);
            if (eventData) {
                const regexData = regex.exec(eventData[dayIndex]);
                const location = regexData[1] ? regexData[1].trim() : '';
                const start = regexData[2] ? regexData[2].trim() : '';
                const end = regexData[3] ? regexData[3].trim() : '';
                cell.textContent += "Start: " + start;
                cell.innerHTML += "<br>End: " + end;
                cell.innerHTML += "<br>Location: " + location;
            } else {
                cell.textContent = 'No data';
            }
        }
    });

    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');

    modalOverlay.appendChild(table);

    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', function (event) {
        if (event.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
}

function getData(sport) {
    var table = document.getElementById("calendarBody");
    var data = new Map();
    for (var i = 0, row; row = table.rows[i]; i++) {
        var team = sport_lists.get(sport)[i];
        var temparr = [];
        for (var j = 1, col; col = row.cells[j]; j++) {
            temparr[j-1] = '';
            var locSelect = col.getElementsByTagName("select")[0];
            if(locSelect.options[locSelect.selectedIndex].value != '')
                temparr[j-1] += (((locSelect.options[locSelect.selectedIndex].text)));
            var startTime = col.getElementsByTagName("input")[0]; 
            if (startTime.value != '')
                temparr[j-1] += formatTime(startTime.value);
            var endTime = col.getElementsByTagName("input")[1]; 
            if (endTime.value != '')
                temparr[j-1] += formatTime(endTime.value);
        }
        data.set(team, temparr);
    }
    return data;
}

function save() {
    var sport = current;
    storage.set(sport, getData(sport));
}

function formatSport(sport) {
    var newSport;
    switch (sport) {
        case "tennis":
            newSport = "Tennis";
            break;
        case "baseball":
            newSport = "Baseball"
            break;
        case "softball":
            newSport = "Softball";
            break;
        case "lacrosse":
            newSport = "Lacrosse";
            break;
        case "crew":
            newSport = "Crew";
            break;
        case "golf":
            newSport = "Golf";
            break;
        case "dance":
            newSport = "Dance";
            break;
        case "yoga":
            newSport= "Yoga";
            break;
        case "fit":
            newSport = "Fitness";
            break;
        case "sc":
            newSport = "Strength & Conditioning";
            break;
        default:
            newSport = 'undefined';

    }
    return newSport;
}

function formatTeam(team) {
        switch (team) {
        case "BV":
            newTeam = "Varsity Boys ";
            break;
        case "BJV":
            newTeam = "JV Boys ";
            break;
        case "GV":
            newTeam = "Varsity Girls ";
            break;
        case "GJV":
            newTeam = "JV Girls ";
            break;
        case "B3":
            newTeam = "Boys Thirds ";
            break;
        case "G3":
            newTeam = "Girls Thirds ";
            break;
        case "Rec":
            newTeam = "Rec ";
            break;
        case "Boys":
            newTeam = "Boys ";
            break;
        case "Girls":
            newTeam = "Girls ";
            break;
        case "Varsity":
            newTeam = "Varsity ";
            break;
        case "JV":
            newTeam = "JV ";
            break;
        default:
            newTeam = '';
    }
    return newTeam;
}

function formatDate(input = new Date()) {
    const formatted = input.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  
    return formatted;
  }

function formatTime(time) {
    const timeParts = time.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
  
    const period = hours >= 12 ? "PM" : "AM";
    const newHours = hours % 12 || 12;
  
    const newTime = `${newHours}:${minutes} ${period}`;
  
    return newTime;
}

function formatISO(date, time) {
    const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(n => String(n).padStart(2, '0'));
    const [hours, minutes] = time.split(':').map(n => String(n).padStart(2, '0'));
    const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`;

    return isoString;
}

function reverseTime(timeString) {
    var timeArray = timeString.split(' ');
    var timeParts = timeArray[0].split(':');
    var hours = parseInt(timeParts[0]);
    var minutes = parseInt(timeParts[1]);
    
    if (timeArray[1] === 'PM' && hours < 12) {
      hours += 12;
    } else if (timeArray[1] === 'AM' && hours === 12) {
      hours = 0;
    }
  
    var formattedHours = hours < 10 ? '0' + hours : hours;
    var formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  
    return formattedHours + ':' + formattedMinutes;
  }

function toCSV(data) {
    csv = csv + '\n' + data.join(',');
  }

function toAuto(sport, team) {
    match = formatTeam(team) + formatSport(sport);
    for(var i = 0; i < autolist[1].length; i++) {
        if(autolist[1][i].includes(match)) {
            return autolist[0][i];  
        }
    }
}

function downloadCSV(csv, filename = 'practice.csv') {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
  
    document.body.appendChild(link);
    link.click();
  
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }



//figure out where I can autosave (reread docs)
//add in a data structure that can 

// document.addEventListener('DOMContentLoaded', function () {
//     const calendarBody = document.getElementById('calendarBody');

//     for (let week = 0; week < 4; week++) {
//         const row = document.createElement('tr');

//         const cell = document.createElement('td');
//         cell.innerHTML += sport;
//         row.appendChild(cell)

//         for (let day = 0; day < 6; day++) {
//             const cell = document.createElement('td');
//             const time = document.createElement('input');
//             time.type = "time";
//             const location = document.createElement('select');
//             const option = document.createElement('option');
//             option.disabled = true;
//             option.selected = true;
//             option.text = "Select an option: ";
//             location.appendChild(option);
//             for (let i = 0; i <= 5; i++) {
//                 const option = document.createElement('option');
//                 option.value = loclist[0][i];
//                 option.text = loclist[1][i];
//                 location.appendChild(option);
//             }
//             const game = document.createElement('input');
//             game.type = "checkbox";
//             cell.innerHTML += "Time: ";
//             cell.appendChild(time);
//             cell.innerHTML += "Location: ";
//             cell.appendChild(location);
//             cell.innerHTML += "Game: ";
//             cell.appendChild(game);

//             cell.addEventListener('change', function () {
//                     // You can handle dropdown change here if needed
//             });
//             row.appendChild(cell);
//         }

//         calendarBody.appendChild(row);
//     }
// });


