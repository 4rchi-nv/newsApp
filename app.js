// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

const form = document.forms['newsControls'];
const searchInput = form.elements['search'];
const countrySelect = form.elements['country'];

form.addEventListener('submit', e => {
  e.preventDefault();
  gridContainer.children.remove();
  loadNews();
});

// Init http module
const http = customHttp();
//ui
const newsService = (function() {
  const apiUrl = 'https://newsapi.org/v2';
  const apiKey = '79cb65e664cf40188b8fcb6711ae8e53';
  return {
    topHeadlines(country='ru', cb){
      http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb){
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  }
})();
//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});

//когда отправляем запрос
function loadNews() {
  showPreloader();

  const country = countrySelect.value;
  const searchText = searchInput.value;
  if(!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}
//когда получаем ответ
function onGetResponse(err, { articles }) {
  if(err) {
    toaster(err, 'err-msg red rounded lighten-2');
  }

  if(!articles.children.length) {
    //show that there is no articles
  }

  renderNews(articles);
}

function renderNews(news) {
  const gridContainer = document.querySelector('.news-container .grid-container');
  // removeElements(gridContainer);
  let fragment = document.createDocumentFragment();
  fragment = '';
  news.forEach(element => {
    const item = newsTemplate(element);
    fragment += item;
  });
  gridContainer.insertAdjacentHTML('afterbegin', fragment);
}

function newsTemplate({ url, title, urlToImage, description }) {
  return `
  <div class="row">
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${ title }</span>
        </div>
        <div class="card-content">
          <p>${description}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  </div>
  `
}

function removeElements(container) {
  let child = container.lastElementChild;
  while(child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

//element.remove()
//element.removeChild(childHTML);

//добавляем функ для загрузчика
function showPreloader() {
  document.body.insertAdjacentHTML(
    'afterbegin', 
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
    `);
}

//добавляем функ для загрузчика
function removePreloader() {
  const loader = document.querySelector('.progress');
  if(loader) {
    loader.remove();
  }
}

function toaster(msg, type='success') {
  M.toast({ html: msg, classes: type });
}