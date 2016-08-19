import Koa from 'koa'
import convert from 'koa-convert'
import webpack from 'webpack'
import webpackConfig from '../build/webpack.config'
import historyApiFallback from 'koa-connect-history-api-fallback'
import serve from 'koa-static'
import proxy from 'koa-proxy'
import request from 'request'
import _ from 'lodash'
import _debug from 'debug'
import config from '../config'
import webpackDevMiddleware from './middleware/webpack-dev'
import webpackHMRMiddleware from './middleware/webpack-hmr'
import monk from 'monk'
import wrap from 'co-monk'
//const db = monk('localhost/NextFlick')
// const db = monk('ds145395.mlab.com:45395/nextflick', {username : 'anitu', password : 'admin'})
const db = monk('anitu:admin@ds145395.mlab.com:45395/nextflick')
const movies = wrap(db.get('movies'))
const actors = wrap(db.get('actors'))
const directors = wrap(db.get('directors'))
const genres = wrap(db.get('genres'))
const conflicts = wrap(db.get('conflicts'))
const affiliations = wrap(db.get('affiliations'))
const locations = wrap(db.get('locations'))
const users = wrap(db.get('users'))

const debug = _debug('app:server')
const paths = config.utils_paths
const app = new Koa()
const router = require('koa-router')()
const bodyParser = require('koa-body-parser')

router.post('/api/recommendations', function *() {
  const entry = yield movies.find({})
  let thisMovie = entry.filter(x => x.Movie.trim().toLowerCase() === this.request.body.movie.trim().toLowerCase())
  const fullMovieData = []
  if (thisMovie.length >= 1) {
    thisMovie = thisMovie[0]
    let movieScores = []
    console.log(entry)
  // genres
    for (let i = 0; i < thisMovie.Genre.length; i++) {
      const moviesWithSameGeners = entry
        .filter(x => x.Genre.indexOf(thisMovie.Genre[i]) !== -1)
        .filter(x => x.Movie !== thisMovie.Movie)
      for (let j = 0; j < moviesWithSameGeners.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSameGeners[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSameGeners[j].Movie, score: 5})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSameGeners[j].Movie)[0]
          currMovie.score = currMovie.score + 5
        }
      }
    }
    // actors
    for (let i = 0; i < thisMovie.Actor.length; i++) {
      const moviesWithSameActors = entry
        .filter(x => x.Actor.indexOf(thisMovie.Actor[i]) !== -1)
        .filter(x => x.Movie !== thisMovie.Movie)

      const moviesWithSimActors = entry
        .filter(x => x.SimilarActor.indexOf(thisMovie.Actor[i]) !== -1)
        .filter(x => x.Movie !== thisMovie.Movie)

      for (let j = 0; j < moviesWithSameActors.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSameActors[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSameActors[j].Movie, score: 10})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSameActors[j].Movie)[0]
          currMovie.score = currMovie.score + 10
        }
      }

      for (let j = 0; j < moviesWithSimActors.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSimActors[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSimActors[j].Movie, score: 5})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSimActors[j].Movie)[0]
          currMovie.score = currMovie.score + 5
        }
      }
    }

      // directors
    for (let i = 0; i < thisMovie.Director.length; i++) {
      const moviesWithSameDirectors = entry
        .filter(x => x.Director.indexOf(thisMovie.Director[i]) !== -1)
        .filter(x => x.Movie !== thisMovie.Movie)

      const moviesWithSimDirectors = entry
        .filter(x => x.SimilarDirector.indexOf(thisMovie.Director[i]) !== -1)
        .filter(x => x.Movie !== thisMovie.Movie)

      for (let j = 0; j < moviesWithSameDirectors.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSameDirectors[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSameDirectors[j].Movie, score: 10})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSameDirectors[j].Movie)[0]
          currMovie.score = currMovie.score + 10
        }
      }

      for (let j = 0; j < moviesWithSimDirectors.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSimDirectors[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSimDirectors[j].Movie, score: 5})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSimDirectors[j].Movie)[0]
          currMovie.score = currMovie.score + 5
        }
      }
    }

      // conflicts
    for (let i = 0; i < thisMovie.CentralConflict.length; i++) {
      const moviesWithSameConflicts = entry
        .filter(x => x.CentralConflict.indexOf(thisMovie.CentralConflict[i]) !== -1)
        .filter(x => x.Movie !== thisMovie.Movie)
      for (let j = 0; j < moviesWithSameConflicts.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSameConflicts[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSameConflicts[j].Movie, score: 3})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSameConflicts[j].Movie)[0]
          currMovie.score = currMovie.score + 3
        }
      }
    }

      // affiliations
    for (let i = 0; i < thisMovie.Affiliation.length; i++) {
      const moviesWithSameAffiliation = entry
        .filter(x => x.Affiliation.indexOf(thisMovie.Affiliation[i]) !== -1)
        .filter(x => x.Movie !== thisMovie.Movie)
      for (let j = 0; j < moviesWithSameAffiliation.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSameAffiliation[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSameAffiliation[j].Movie, score: 1})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSameAffiliation[j].Movie)[0]
          currMovie.score = currMovie.score + 1
        }
      }
    }

      // indie
    if (thisMovie.Indie === 'Yes') {
      const moviesWithSameIndie = entry
        .filter(x => x.Indie === thisMovie.Indie)
        .filter(x => x.Movie !== thisMovie.Movie)

      for (let j = 0; j < moviesWithSameIndie.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSameIndie[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSameIndie[j].Movie, score: 1})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSameIndie[j].Movie)[0]
          currMovie.score = currMovie.score + 1
        }
      }
    }

      // awards
    if (thisMovie.Awards === 'Yes') {
      const moviesWithSameAwards = entry
        .filter(x => x.Awards === thisMovie.Awards)
        .filter(x => x.Movie !== thisMovie.Movie)

      for (let j = 0; j < moviesWithSameAwards.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSameAwards[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSameAwards[j].Movie, score: 1})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSameAwards[j].Movie)[0]
          currMovie.score = currMovie.score + 1
        }
      }
    }

      // strong female lead
    if (thisMovie.StrongFemaleLead === 'Yes') {
      const moviesWithSameStrongFemaleLead = entry
        .filter(x => x.StrongFemaleLead === thisMovie.StrongFemaleLead)
        .filter(x => x.Movie !== thisMovie.Movie)

      for (let j = 0; j < moviesWithSameStrongFemaleLead.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSameStrongFemaleLead[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSameStrongFemaleLead[j].Movie, score: 5})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSameStrongFemaleLead[j].Movie)[0]
          currMovie.score = currMovie.score + 5
        }
      }
    }

      // location
    if (thisMovie.Location !== '') {
      const moviesWithSameLocation = entry
        .filter(x => x.Location === thisMovie.Location)
        .filter(x => x.Movie !== thisMovie.Movie)

      for (let j = 0; j < moviesWithSameLocation.length; j++) {
        let movieScore = movieScores.filter(x => x.movie === moviesWithSameLocation[j].Movie)
        if (movieScore.length === 0) {
          movieScores.push({movie: moviesWithSameLocation[j].Movie, score: 3})
        } else {
          const currMovie = movieScores.filter(x => x.movie === moviesWithSameLocation[j].Movie)[0]
          currMovie.score = currMovie.score + 3
        }
      }
    }
    // Tomato Rating
    const moviesWithLowerTomatoRating = entry
      .filter(x => x.addTomatoRating < 6)
      .filter(x => x.Movie !== thisMovie.Movie)

    for (let j = 0; j < moviesWithLowerTomatoRating.length; j++) {
      let movieScore = movieScores.filter(x => x.movie === moviesWithLowerTomatoRating[j].Movie)
      if (movieScore.length === 0) {
        movieScores.push({movie: moviesWithLowerTomatoRating[j].Movie, score: -3})
      } else {
        const currMovie = movieScores.filter(x => x.movie === moviesWithLowerTomatoRating[j].Movie)[0]
        currMovie.score = currMovie.score - 3
      }
    }

    // Tomato Meter
    const moviesWithLowerTomatoMeter = entry
      .filter(x => x.addTomatoMeter < 60)
      .filter(x => x.Movie !== thisMovie.Movie)

    for (let j = 0; j < moviesWithLowerTomatoMeter.length; j++) {
      let movieScore = movieScores.filter(x => x.movie === moviesWithLowerTomatoMeter[j].Movie)
      if (movieScore.length === 0) {
        movieScores.push({movie: moviesWithLowerTomatoMeter[j].Movie, score: -3})
      } else {
        const currMovie = movieScores.filter(x => x.movie === moviesWithLowerTomatoMeter[j].Movie)[0]
        currMovie.score = currMovie.score - 3
      }
    }

    // Tomato User Meter
    const moviesWithLowerTomatoUserMeter = entry
      .filter(x => x.addTomatoUserMeter < 60)
      .filter(x => x.Movie !== thisMovie.Movie)

    for (let j = 0; j < moviesWithLowerTomatoUserMeter.length; j++) {
      let movieScore = movieScores.filter(x => x.movie === moviesWithLowerTomatoUserMeter[j].Movie)
      if (movieScore.length === 0) {
        movieScores.push({movie: moviesWithLowerTomatoUserMeter[j].Movie, score: -3})
      } else {
        const currMovie = movieScores.filter(x => x.movie === moviesWithLowerTomatoUserMeter[j].Movie)[0]
        currMovie.score = currMovie.score - 3
      }
    }

    const moviesWithYear = entry
      .filter(x => {
        for (let j = 0; j < movieScores.length; j++) {
          if (x.Movie.trim().toLowerCase() === movieScores[j].movie.trim().toLowerCase()) {
            return true
          }
        }
        return false
      })
    moviesWithYear.map(x => {
      if (Math.abs(x.Year - thisMovie.Year) >= 10) {
        const currMovie = movieScores.filter(y => y.movie === x.Movie)[0]
        currMovie.score = currMovie.score - 3
      }
    })

    movieScores = _.sortBy(movieScores, 'score').reverse().filter(x => x.score >= 15)

    for (let j = 0; j < movieScores.length; j++) {
      const mov = entry.filter(x => x.Movie === movieScores[j].movie)[0]
      mov.score = movieScores[j].score
      fullMovieData.push(mov)
    }
  }
  this.body = fullMovieData
})

router.post('/api/additionaldata', function *() {
  movies.find({}, function (err, entry) {
    if (err) {
      return 'Error'
    }
    entry.map(e => getAddlData(e.Movie))
  })

  this.body = true
})

const getAddlData = function (movie) {
  const concatenatedName = movie.trim().replace(' ', '+')
  request({method: 'GET', uri: 'http://www.omdbapi.com/?t=' + concatenatedName + '&y=&plot=short&r=json&tomatoes=true'},
   function (error, response, body) {
     if (!error && response.statusCode === 200) {
       const bodyJson = JSON.parse(body)
       if (bodyJson.Response === 'True') {
         movies.update({Movie: movie},
           {
             $set: {
               addPoster: bodyJson.Poster,
               addPlot: bodyJson.Plot,
               addActors: bodyJson.Actors,
               addDirector: bodyJson.Director,
               addTomatoRating: bodyJson.tomatoRating,
               addTomatoUserMeter: bodyJson.tomatoUserMeter,
               addTomatoMeter: bodyJson.tomatoMeter
             }
           })
       }
     }
   })
}

router.post('/api/login', function *() {
  const result = yield users.count({username: this.request.body.username, password: this.request.body.password})
  this.body = result === 1
})

router.get('/api/whatever', function *() {
  const result = yield movies.find({})
  this.body = result
})

router.post('/api/movies', function *() {
  yield insertMovies(this.request.body)
  const result = yield movies.find({})
  this.body = result
})

router.get('/api/actors', function *() {
  const result = yield actors.find({})
  this.body = result
})

router.get('/api/genres', function *() {
  const result = yield genres.find({})
  this.body = result
})

router.get('/api/conflicts', function *() {
  const result = yield conflicts.find({})
  this.body = result
})
router.get('/api/locations', function *() {
  const result = yield locations.find({})
  this.body = result
})

router.get('/api/affiliations', function *() {
  const result = yield affiliations.find({})
  this.body = result
})

router.post('/api/actors', function *() {
  yield insertActors(this.request.body)
  const result = yield actors.find({})
  this.body = result
})

router.post('/api/directors', function *() {
  yield insertDirectors(this.request.body)
  const result = yield directors.find({})
  this.body = result
})

router.post('/api/genres', function *() {
  yield insertGenres(this.request.body)
  const result = yield genres.find({})
  this.body = result
})

router.post('/api/conflicts', function *() {
  yield insertConflicts(this.request.body)
  const result = yield conflicts.find({})
  this.body = result
})

router.post('/api/locations', function *() {
  yield insertLocations(this.request.body)
  const result = yield locations.find({})
  this.body = result
})

router.post('/api/affiliations', function *() {
  yield insertAffiliations(this.request.body)
  const result = yield affiliations.find({})
  this.body = result
})

router.post('/api/saveMovie', function *() {
  yield saveMovie(this.request.body)
  const result = yield movies.find({})
  this.body = result
})
router.post('/api/editMovie', function *() {
  yield editMovie(this.request.body)
  const result = yield movies.find({})
  this.body = result
})
router.post('/api/deleteMovie', function *() {
  yield deleteMovie(this.request.body)
  const result = yield movies.find({})
  this.body = result
})

router.get('/api/directors', function *() {
  const result = yield directors.find({})
  this.body = result
})

const tryLogin = function *(data) {
  return users.find({username: data.username, password: data.password}, function (err, entry) {
    if (err) {
      return 'Error'
    }
    if (entry.length === 0) {
      return false
    }
    return true
  })
}

const insertMovies = function *(data) {
  return data.map(movie => {
    movies.find({Movie: movie.Movie}, function (err, entry) {
      if (err) {
        console.log('Error in first query')
        // return res.status(500).send('Something went wrong getting the data')
      }
      movies.update({Movie: movie.Movie}, movie)
      if (entry.length === 0) {
        movies.insert(movie)
      }
    })
  })
}

const saveMovie = function *(data) {
  console.log(data)
  return data.map(movie => {
    movies.find({Movie: movie.Movie}, function (err, entry) {
      if (err) {
        console.log('Error in first query')
        // return res.status(500).send('Something went wrong getting the data')
      }
      if (entry.length === 0) {
        movies.insert(movie)
      }
    })
  })
}

const editMovie = function *(data) {
  console.log(data)
  return data.map(movie => {
    movies.find({_id: monk.id(movie._id)}, function (err, entry) {
      if (err) {
        console.log('Error in first query')
        // return res.status(500).send('Something went wrong getting the data')
      }
      if (entry.length === 1) {
        movies.update({_id: monk.id(movie._id)}, {$set: movie})
      }
    })
  })
}

const deleteMovie = function *(data) {
  console.log(data)
  movies.find({_id: monk.id(data.id)}, function (err, entry) {
    if (err) {
      console.log('Error in first query')
      // return res.status(500).send('Something went wrong getting the data')
    }
    console.log(entry)
  })
  movies.remove({_id: monk.id(data.id)})
  return 1 // movies.remove({Movie: data})
}

const insertActors = function *(data) {
  console.log(data)
  return data.map(actor => {
    actors.find({name: actor.name}, function (err, entry) {
      if (err) {
        console.log('Error in first query')
        // return res.status(500).send('Something went wrong getting the data')
      }
      actors.update({name: actor.name}, actor)
      if (entry.length === 0) {
        actors.insert(actor)
      }
    })
  })
}

const insertDirectors = function *(data) {
  console.log(data)
  return data.map(director => {
    directors.find({name: director.name}, function (err, entry) {
      if (err) {
        console.log('Error in first query')
        // return res.status(500).send('Something went wrong getting the data')
      }
      directors.update({name: director.name}, director)
      if (entry.length === 0) {
        directors.insert(director)
      }
    })
  })
}

const insertAffiliations = function *(data) {
  console.log(data)
  return data.map(aff => {
    affiliations.find({name: aff.name}, function (err, entry) {
      if (err) {
        console.log('Error in first query')
        // return res.status(500).send('Something went wrong getting the data')
      }
      affiliations.update({name: aff.name}, aff)
      if (entry.length === 0) {
        affiliations.insert(aff)
      }
    })
  })
}

const insertLocations = function *(data) {
  console.log(data)
  return data.map(locc => {
    locations.find({name: locc.name}, function (err, entry) {
      if (err) {
        console.log('Error in first query')
        // return res.status(500).send('Something went wrong getting the data')
      }
      locations.update({name: locc.name}, locc)
      if (entry.length === 0) {
        locations.insert(locc)
      }
    })
  })
}

const insertGenres = function *(data) {
  console.log(data)
  return data.map(gen => {
    genres.find({name: gen.name}, function (err, entry) {
      if (err) {
        console.log('Error in first query')
        // return res.status(500).send('Something went wrong getting the data')
      }
      genres.update({name: gen.name}, gen)
      if (entry.length === 0) {
        genres.insert(gen)
      }
    })
  })
}

const insertConflicts = function *(data) {
  console.log(data)
  return data.map(conf => {
    conflicts.find({name: conf.name}, function (err, entry) {
      if (err) {
        console.log('Error in first query')
        // return res.status(500).send('Something went wrong getting the data')
      }
      conflicts.update({name: conf.name}, conf)
      if (entry.length === 0) {
        conflicts.insert(conf)
      }
    })
  })
}

app.use(bodyParser())
app.use(router.routes())
// Enable koa-proxy if it has been enabled in the config.
if (config.proxy && config.proxy.enabled) {
  app.use(convert(proxy(config.proxy.options)))
}

// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement isomorphic
// rendering, you'll want to remove this middleware.
app.use(convert(historyApiFallback({
  verbose: false
})))

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
  const compiler = webpack(webpackConfig)

  // Enable webpack-dev and webpack-hot middleware
  const { publicPath } = webpackConfig.output

  app.use(webpackDevMiddleware(compiler, publicPath))
  app.use(webpackHMRMiddleware(compiler))

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(serve(paths.client('static')))
} else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(serve(paths.dist()))
}

export default app
