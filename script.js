//getting all the required elements by id
var allPrograms = document.getElementById('allPrograms');
var searchElement = document.getElementById('searchProgram');
var programTypeElement = document.getElementById('types');
var programFacultyElement = document.getElementById('faculties');
var programTitleElement = document.getElementById('programTitles');
var suggestionPanel = document.querySelector('.suggestions');

// var inputtagvalue = document.getElementsByClassName('inputtagvalue');

// fetching data from JSON using Fetch API
async function fetchData() {
  var baseUrl = 'https://ontariotechu.ca/programs/index.json';
  var response = await fetch(baseUrl);
  let data = await response.json();
  jsonData = data;
  return data;
}

//populating data of all programs when the page loads
fetchData().then((data) => {
  document.getElementById('title').innerHTML = data.programs.title;

  document.getElementById('description').innerText = data.programs.description;

  data.programs.program.forEach((program, index) => {
    var container = document.createElement('div');
    container.setAttribute('class', 'accordion-single');
    container.innerHTML = `
        <button class="accordion" onclick="clickRender(${index})">${program.title} <span class="toggle-switch" id="toggle${index}"><i class="fa fa-greater-than"></i></span></button>
        <div class="panel">
            <p>${program.summary}</p>
            <p>For more information on this program please <a href="https://ontariotechu.ca/programs/${program.link}" target="_blank">click here</a><p>
        </div>
    `;
    allPrograms.append(container);
  });
});

//searching programs and generating predictive text
function searchProgram() {
  var searchTerm = searchElement.value;
  console.log(searchTerm);
  suggestionPanel.innerText = '';
  fetchData().then((data) => {
    let matches = data.programs.program.filter((program) => {
      return program.title.toLowerCase().startsWith(searchTerm.toLowerCase());
    });
    console.log(matches);
    if (matches.length > 1) {
      matches.forEach((suggestion, index) => {
        console.log(typeof suggestion.title);
        const span = document.createElement('span');
        span.innerHTML = `
          <div onclick="autocomplete('${suggestion.title}')">
          ${suggestion.title}
          </div>
        `;
        suggestionPanel.appendChild(span);
      });
    }
    if (searchTerm === '') {
      suggestionPanel.innerHTML = '';
    }
    if (matches.length > 0) {
      var result = ' ';
      matches.map((program, index) => {
        result += `
        <div class="accordion-single">
        <button class="accordion" onclick="clickRender(${index})">${program.title} <span class="toggle-switch" id="toggle${index}"><i class="fa fa-greater-than"></i></span></button>
            <div class="panel">
                <p>${program.summary}</p>
                <p>For more information on this program please <a href="https://ontariotechu.ca/programs/${program.link}" target="_blank">click here</a><p>
            </div>
        </div>
        `;
      });
      allPrograms.innerHTML = result;
    }
  });
}

//clearing values when clear button is clicked.
function clearvalues() {
  searchElement.value = '';
  searchProgram();
}

//assigning autocoomplete clicked fields in the input tag.
function autocomplete(index) {
  suggestionPanel.innerHTML = '';
  searchElement.value = index;
  searchProgram();
}

// accordion displaying preview data when clicked.
function clickRender(i) {
  let toggleid = 'toggle' + i;
  var acc = document.getElementsByClassName('accordion');
  acc[i].classList.toggle('active');
  var panel = acc[i].nextElementSibling;
  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    document.getElementById(toggleid).innerHTML =
      '<i class="fa fa-greater-than"></i>';
  } else {
    panel.style.display = 'block';
    document.getElementById(toggleid).innerHTML =
      '<i class="fas fa-chevron-down"></i>';
  }
}

//get unique values
function uniqueValues(arr) {
  return [...new Set(arr)];
}

//populating dropdown
function populate(arr, element) {
  for (var i = 0; i < arr.length; i++) {
    var option = arr[i];
    var optionElement = document.createElement('option');
    optionElement.textContent = option;
    optionElement.value = option;
    element.appendChild(optionElement);
  }
}

//getting unique program types and populating to the values to the dropdown list
fetchData().then((data) => {
  const programsData = [...data.programs.program];
  //getting unique values from multiple program_type arrays
  let programTypes = programsData.map((program) => program.program_type);
  let uniqueProgramTypes = [];
  for (var i = 0; i < programTypes.length; i++) {
    uniqueProgramTypes = [
      ...new Set(uniqueProgramTypes.concat(programTypes[i])),
    ];
  }
  //populating program type values to dropdown
  populate(uniqueProgramTypes, programTypeElement);
});

//populating program faculties based on selected program type option
function selectProgramType() {
  var selectedProgramType = programTypeElement.value;
  programFacultyElement.innerHTML =
    '<option selected disabled hidden>Choose faculty</option>';
  programTitleElement.innerHTML =
    '<option selected disabled hidden>Choose program</option>';
  var faculties = [];
  fetchData().then((data) => {
    data.programs.program.forEach((program) => {
      if (program.program_type.includes(selectedProgramType)) {
        faculties.push(program.faculty);
      }
    });
    populate(uniqueValues(faculties), programFacultyElement);
  });
}

//populating the program titles based on faculty
function selectProgramFaculty() {
  var selectedFaculty = programFacultyElement.value;
  console.log(selectedFaculty);
  programTitleElement.innerHTML =
    '<option selected disabled hidden>Choose program</option>';
  var programTitles = [];
  fetchData().then((data) => {
    data.programs.program.forEach((program) => {
      if (
        program.faculty === selectedFaculty &&
        program.program_type.includes(programTypeElement.value)
      ) {
        programTitles.push(program.title);
      }
    });
    populate(uniqueValues(programTitles), programTitleElement);
  });
}

//enabling the button when all the options for find the program are selected.
function selectProgramTitle() {
  var selectedtitle = programTitleElement.value;
  console.log(programTypeElement.value);
  console.log(programFacultyElement.value);
  console.log(programTitleElement.value);
  if (
    programTypeElement.value !== '' &&
    programFacultyElement.value !== 'Choose ' &&
    programTitleElement.value !== 'Choose program'
  ) {
    document.getElementById('findButton').disabled = false;
  }
}

//program finder function - since the title of the program is unique and as we are filtering all the other components while populating dropdown options, I am comparing the program title to the selected option title
function programFinder() {
  fetchData().then((data) => {
    var program = data.programs.program.filter(
      (program) => program.title == programTitleElement.value
    );
    window.open('https://ontariotechu.ca/programs/' + program[0].link);
  });
  document.getElementById('findButton').disabled = true;
}
