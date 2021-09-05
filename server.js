const express = require('express')

const scraper = require('./utils/scraper')
const app = express()

app.get('/getUserMediaLink', (req, res) => {
  const username = req.query.username;
  const mediumArticles = new Promise((resolve, reject) => {
    scraper
      .scrapeMedium(username)
      .then(data => {
        resolve(data)
      })
      .catch(err => 
        reject(err)
     )
  })

  Promise.all([mediumArticles])
    .then(data => {
      res.status(200).send(data[0])
    })
    .catch(err => {
        res.status(500).send(err)
    })
})

app.listen(process.env.PORT || 3000)