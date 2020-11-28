// keeps the App state - mutable
let store = {
  apod: '',
  selectedRover: '',
  latestPhotos: '',
  // rovers list is immutable
  rovers: Immutable.List(['curiosity', 'opportunity', 'spirit']),
};

// add our markup to the page
const root = document.getElementById('root');
// function updates state
const updateStore = (newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};
// Pure function that renders list of rovers to choose from
const renderRoversList = (rovers, selectedRover) => {
  if (selectedRover === 'curiosity') {
    return `
              <select name="rovers" id="rovers" onchange="selectRover()">
                <option value="${rovers.get(0)}">${rovers.get(0)}</option>
                <option value="${rovers.get(1)}">${rovers.get(1)}</option>
                <option value="${rovers.get(2)}">${rovers.get(2)}</option>
              </select>
            `;
  }
  if (selectedRover === 'opportunity') {
    return `
              <select name="rovers" id="rovers" onchange="selectRover()">
                <option value="${rovers.get(1)}">${rovers.get(1)}</option>
                <option value="${rovers.get(0)}">${rovers.get(0)}</option>
                <option value="${rovers.get(2)}">${rovers.get(2)}</option>
              </select>
            `;
  }
  if (selectedRover === 'spirit') {
    return `
              <select name="rovers" id="rovers" onchange="selectRover()">
                <option value="${rovers.get(2)}">${rovers.get(2)}</option>
                <option value="${rovers.get(0)}">${rovers.get(0)}</option>
                <option value="${rovers.get(1)}">${rovers.get(1)}</option>
              </select>
            `;
  }
  return `
              <select name="rovers" id="rovers" onchange="selectRover()">
                <option value="">select rover</option>
                <option value="${rovers.get(0)}">${rovers.get(0)}</option>
                <option value="${rovers.get(1)}">${rovers.get(1)}</option>
                <option value="${rovers.get(2)}">${rovers.get(2)}</option>
              </select>
            `;
};
// Pure function that renders header
const renderHeader = (rovers, selectedRover) => {
  const headers = `<h1>Mars Rovers Dashboard</h1>
                   <h3>Choose the rover from the list below:</h3>
                   <div>${renderRoversList(rovers, selectedRover)}</div>`;
  if (selectedRover !== '') {
    return `${headers}
            <h3>You selected ${selectedRover}!</h3>`;
  }
  return `${headers}`;
};

// Pure function that renders selected rover's base data
const renderRoverBaseData = (roverName, latestPhotos) => {
  if (roverName !== '') {
    const baseData = latestPhotos.photos.latest_photos[0];
    return `
              <ul>
                <li>Landing date: ${baseData.rover.landing_date}</li>
                <li>Launch date: ${baseData.rover.launch_date}</li>
                <li>Status: ${baseData.rover.status}</li>
                <li>Most recent available photos: ${baseData.earth_date}</li>
              </ul>
              <h3>Let's see what are ${roverName}'s latest photos</h3>
            `;
  }
  return `
        <h1>Hello!</h1>
    `;
};
// Higher order function that returns function rendering images
const renderImages = (images) => {
  if (images !== '') {
    // USE MAP function to extract img urls from latestPhotos object in store
    const imgUrls = images.photos.latest_photos.map((img) => img.img_src);

    const renderImgUrls = () => {
      // USE MAP to convert urls into html tags
      const imgTags = imgUrls.map((url) => `<img src="${url}" />`);
      console.log(imgUrls);
      return imgTags[0];
    };
    // return function rendering img html tags
    return renderImgUrls;
  }
};

// create content
const App = () => {
  const { rovers, apod, selectedRover, latestPhotos } = store;
  if (selectedRover !== '' && latestPhotos !== '') {
    return `<header>${renderHeader(rovers, selectedRover)}</header>
            <main>
              <section>
                <div>${renderRoverBaseData(selectedRover, latestPhotos)}</div>
                <div>${renderImages(latestPhotos)()}</div>
              </section>
            </main>
            <footer></footer>
        `;
  }
  return `
        <header>${renderHeader(rovers, selectedRover)}</header>
        <main>
            <section>
                <p>
                    Look!
                </p>
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
  render(root, store);
});

// Handles changes in rovers select dropdown list
const selectRover = () => {
  const selectedElement = document.getElementById('rovers');
  if (selectedElement) {
    const selectedRover = selectedElement.value;
    updateStore({ selectedRover });
    getRoverData(store);
  }
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === 'video') {
    return `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `;
  }
  return `
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation.substring(0, 100)}</p>
        `;
};

// ------------------------------------------------------  API CALLS
// API call to get select image of the day
const getImageOfTheDay = (state) => {
  const { apod } = state;

  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => updateStore({ apod }));
  return apod;
};
// API call to get select rover's data
const getRoverData = (state) => {
  const url = new URL('http://localhost:3000/rovers');
  url.searchParams.append('name', state.selectedRover);
  fetch(url)
    .then((res) => res.json())
    .then((latestPhotos) => updateStore({ latestPhotos }));
};
