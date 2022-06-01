import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './sass/main.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api';
const parameters = new URLSearchParams({
  key: '27493415-caff1e79bf6baf64c8d3710ef',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
});
const variableParameters = {
  searchValue: '',
  page: null,
  per_page: 40,
};

const galleryRef = document.querySelector('.gallery');
const searchFormRef = document.querySelector('.search-form');
const { searchQuery } = searchFormRef.elements;
const loadMoreBtnRef = document.querySelector('.load-more');

searchFormRef.addEventListener('submit', onFormSubmit);
loadMoreBtnRef.addEventListener('click', onLoadMoreBtn);

function onFormSubmit(event) {
  event.preventDefault();
  galleryRef.innerHTML = '';
  loadMoreBtnRef.classList.add('is-hidden');
  variableParameters.searchValue = searchQuery.value.trim();
  variableParameters.page = 1;

  if (variableParameters.searchValue === '') {
    Notify.failure('You should enter something. Just do it!');
    event.currentTarget.reset();
    return;
  }

  fetchPhotoCards(variableParameters)
    .then(response => {
      if (response.data.hits.length === 0) {
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        return;
      }

      Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
      markupRender(response.data);

      gallery.refresh();
    })
    .finally(() => {
      if (galleryRef.children.length === variableParameters.per_page) {
        loadMoreBtnRef.classList.remove('is-hidden');
        return;
      }

      if (galleryRef.children.length > 0) {
        Notify.failure('We are sorry, but you have reached the end of search results.');
      }
    });

  event.currentTarget.reset();
}

function onLoadMoreBtn() {
  variableParameters.page += 1;

  fetchPhotoCards(variableParameters).then(response => {
    markupRender(response.data);

    gallery.refresh();

    smoothScrollOnLoadMoreBtn();

    if (galleryRef.children.length === response.data.totalHits) {
      Notify.failure('We are sorry, but you have reached the end of search results.');
      loadMoreBtnRef.classList.add('is-hidden');
    }
  });
}

async function fetchPhotoCards({ searchValue, page, per_page }) {
  return await axios.get(`/?${parameters}`, {
    params: {
      q: searchValue,
      page: page,
      per_page: per_page,
    },
  });
}

function markupRender(arr) {
  const markup = arr.hits
    .map(elem => {
      const { webformatURL, largeImageURL, tags, likes, comments, views, downloads } = elem;
      return `<a href="${largeImageURL}" class="photo-card">               
                    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b> ${likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b> ${views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b> ${comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b> ${downloads}
                        </p>
                    </div> 
              </a>`;
    })
    .join('');

  galleryRef.insertAdjacentHTML('beforeend', markup);
}

function smoothScrollOnLoadMoreBtn() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2.5,
    behavior: 'smooth',
  });
}

let gallery = new SimpleLightbox('.gallery a');
