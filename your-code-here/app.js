// NOTE See HELP.md in this folder for some useful info & tips

import "./tests.js";

const { css } = emotion;
const { useEffect, useState } = React;

const styleContainer = css`
  width: 50%;
  overflow-y: auto;
  height: 800px;
`;

const styleMoviesSection = css`
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const styleMovieList = css`
  list-style-type: circle;
`;

const styleMovieSelect = css`
  margin: 10px 0 10px 0;
`;

const styleMovieControllers = css`
  display: flex;
  flex-direction: column;
`;

const styleSearchController = css`
  height: 25px;
  padding: 5px 8px;
`;



const styleDescription = css`
  display: flex;
  gap: 5%;
  img {
    width: 150px;
    height: 150px;
  }
  p {
    display: flex;
    align-items: center;
  }
`;

const FETCH_MOVIES = 'http://localhost:1234/api/movies.json'
const FETCH_REVIEWS = 'http://localhost:1234/api/reviews.json'
const ROTTEN_TOMATOES = 'https://rottentomatoes.com/m/'
const DECADES = [null, 1960, 1970, 1980, 1990, 2000, 2010]

const SearchByTitle = ({filter, handleChange}) => html`<input className=${styleSearchController} type="text" placeholder="Search by title" value=${filter} onChange=${handleChange}/>`

const DecadeOptions = ({option, onSelect}) => html`<select className=${styleMovieSelect} name="decade" value=${option} onChange=${onSelect}>${DECADES?.map(d => html`<option value=${d}>${d}</option>`)}</select>`

export const App = ({ onLoad }) => {
  const [movies, setMovies] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [filter, setFilter] = useState('')
  const [option, setOption] = useState(null)
  const [description, setDescription] = useState('')
  
  const onSelect = (e) => {
    setOption(e.target.value)
  }

  const handleChange = (e) => {
    setFilter(e.target.value)
  }

  const activeToggle = (id) => {
    const collapseMovies = movies.map(el => {
      if(el.id === id) {
        el['active'] = !el['active']
      }
      return el
    })

    const review = reviews.find(el => el['movie-id'] === id).review
    setDescription(review)
    setMovies(collapseMovies)
  }

  const callAPIMovies = async () => {
    const cachedMovies = JSON.parse(localStorage.getItem('movies'))
    if(!cachedMovies) {
      const jsonData = await fetch(FETCH_MOVIES)
      const newData = await jsonData.json()
      newData.sort((a, b) => (a.title > b.title) ? 1 : -1)
      const newArr = newData.map(el => {
        el['active'] = false
        return el
      })
      const cached = JSON.stringify(newArr)
      localStorage.setItem('movies', cached)
      setMovies(newData)
    } else {
        if(filter && filter.length > 1 && !option) {
          const filteredByTitle = cachedMovies.filter(el => el.title.includes(filter))
          setMovies(filteredByTitle)
        } else if(option && !filter) {
          const filteredByOption = cachedMovies.filter(el => el.year >= option)
          setMovies(filteredByOption)
        } else if(filter && filter.length > 1 && option) {
          const filteredByBoth = movies.filter(el => el.title.includes(filter) && el.year >= option)
          setMovies(filteredByBoth)
        } else {
          setMovies(cachedMovies)
        }
    }
  }

  const callAPIReviews = async () => {
    const cachedReviews = JSON.parse(localStorage.getItem('reviews'))
    if(!cachedReviews) {
      const jsonData = await fetch(FETCH_REVIEWS)
      const newData = await jsonData.json()
      const cached = JSON.stringify(newData)
      localStorage.setItem('reviews', cached)
      setReviews(newData)
    } else {
      setReviews(cachedReviews)
    }
  }

  useEffect(() => {
    callAPIMovies()
    callAPIReviews()
  }, [filter, option])

  useEffect(onLoad, []); // to run tests


  const MovieList = ({movies}) => (
    html`<ol className=${styleMovieList}>
    ${movies?.map(el => html`
        <div key=${el.id} onClick=${() => activeToggle(el.id)}>
          <li>${el.score*100}% <a href=${ROTTEN_TOMATOES+el.title}>${el.title}</a> (${el.year})</li>
          ${
            el.active && html`<div className=${styleDescription}>
                                <img src=${el['cover-url']} />
                                <p>${description}</p>
                              </div>`
          }
        </div>
        `
      )}</ol>`
  )

  return html`
    <div className=${styleContainer}>
      <div className=${styleMoviesSection}>
        <h1>Movies Evan Likes!</h1>
        <h4>Below is a (not) comprenhensive list of movies that Evan really like.</h4>
        <div className=${styleMovieControllers}>
          <div>
            <label for="search">Title Contains: </label><${SearchByTitle} name="search" filter=${filter} handleChange=${handleChange}/>
          </div>
          <div>
            <label for="decade">Decade: </label><${DecadeOptions} name="decade" option=${option} onSelect=${onSelect} />
          </div>
        </div>
      </div>
      <${MovieList} movies=${movies}/>
    </div>
  `;
};
