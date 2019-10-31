const mongoose = require('mongoose')
const mongodbURI = process.env.NODE_ENV === 'test' ? 'mongodb://localhost/trip-planer-test' : 'mongodb://localhost/trip-planer'
mongoose.connect(mongodbURI, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true })

// require('./models/user.test')
// require('./models/site.test')
// require('./models/trip.test')
require('./routes/index.test')