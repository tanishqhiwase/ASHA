// // /jwt-auth/server.js
// const express = require('express')
// const bodyParser = require('body-parser')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')
// const cors = require('cors')
// const multer = require('multer')

// const app = express()
// const PORT = 5000
// const SECRET_KEY = 'supersecret'
// const corsOptions = {
// 	origin: '*',
// 	credentials: true, //access-control-allow-credentials:true
// 	optionSuccessStatus: 200,
// }

// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, 'uploads/')
// 	},
// 	filename: function (req, file, cb) {
// 		cb(null, `${Date.now()}-${file.originalname}`)
// 	},
// })

// const upload = multer({ storage })

// app.use(bodyParser.json())
// app.use(cors(corsOptions))

// let users = []

// // Register route
// app.post('/register', (req, res) => {
// 	const { username, password } = req.body
// 	const userExists = users.find((u) => u.username === username)
// 	if (userExists)
// 		return res.status(400).send({ message: 'User already exists' })

// 	const hashedPassword = bcrypt.hashSync(password, 8)
// 	users.push({ username, password: hashedPassword, profile: null })
// 	res.status(201).send({ message: 'User registered successfully' })
// })

// // Login route
// app.post('/login', (req, res) => {
// 	const { email, password } = req.body
// 	const user = users.find((u) => u.email === email)
// 	if (!user) return res.status(404).send({ message: 'User not found' })

// 	const passwordIsValid = bcrypt.compareSync(password, user.password)
// 	if (!passwordIsValid)
// 		return res.status(401).send({ message: 'Invalid password' })

// 	const token = jwt.sign({ id: user.email }, SECRET_KEY, {
// 		expiresIn: 86400,
// 	})
// 	console.log('User Logged In')
// 	res.status(200).send({ token })
// })

// app.post('/account', upload.single('profileImage'), (req, res) => {
// 	const {
// 		username,
// 		fullName,
// 		age,
// 		dob,
// 		email,
// 		phoneNumber,
// 		pincode,
// 		city,
// 		address,
// 		gender,
// 	} = req.body
// 	const user = users.find((u) => u.username === username)
// 	if (!user) return res.status(404).send({ message: 'User not found' })

// 	user.profile = {
// 		fullName,
// 		age: parseInt(age),
// 		dob,
// 		email,
// 		phoneNumber: parseInt(phoneNumber),
// 		pincode: parseInt(pincode),
// 		city,
// 		address,
// 		gender,
// 		profileImage: req.file ? req.file.path : null,
// 	}
// 	res.status(200).send({ message: 'Account information saved successfully' })
// })

// // Protected route
// app.get('/protected', (req, res) => {
// 	const token = req.headers['authorization']
// 	if (!token) return res.status(403).send({ message: 'No token provided' })

// 	jwt.verify(token, SECRET_KEY, (err, decoded) => {
// 		if (err)
// 			return res
// 				.status(500)
// 				.send({ message: 'Failed to authenticate token' })
// 		res.status(200).send({
// 			message: 'This is a protected route',
// 			user: decoded.id,
// 		})
// 	})
// })

// app.listen(PORT, () => {
// 	console.log(`Server is running on port ${PORT}`)
// })

// /jwt-auth/server.js
const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = 5000
const SECRET_KEY = 'your_secret_key'
const corsOptions = {
	origin: '*',
	credentials: true, //access-control-allow-credentials:true
	optionSuccessStatus: 200,
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors(corsOptions))

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}-${file.originalname}`)
	},
})

const upload = multer({ storage })

let users = []

// Register route
app.post('/register', (req, res) => {
	const { username, password } = req.body
	const userExists = users.find((u) => u.username === username)
	if (userExists)
		return res.status(400).send({ message: 'User already exists' })

	const hashedPassword = bcrypt.hashSync(password, 8)
	users.push({ username, password: hashedPassword, profile: null })
	const token = jwt.sign({ id: username }, SECRET_KEY, {
		expiresIn: 86400,
	})
	res.status(201).send({ message: 'User registered successfully', token })
})

// Login route
app.post('/login', (req, res) => {
	console.log('users', users)
	const { username, password } = req.body
	const user = users.find((u) => u.email === username)
	if (!user) return res.status(404).send({ message: 'User not found' })

	const passwordIsValid = bcrypt.compareSync(password, user.password)
	if (!passwordIsValid)
		return res.status(401).send({ message: 'Invalid password' })

	const token = jwt.sign({ id: user.username }, SECRET_KEY, {
		expiresIn: 86400,
	})
	res.status(200).send({ token, username: user.username })
})

// Account opening form route
app.post('/account', upload.single('profileImage'), (req, res) => {
	const token = req.headers['authorization']
	if (!token) return res.status(403).send({ message: 'No token provided' })

	jwt.verify(token, SECRET_KEY, (err, decoded) => {
		if (err)
			return res
				.status(500)
				.send({ message: 'Failed to authenticate token' })

		const username = decoded.id
		const user = users.find((u) => u.username === username)
		if (!user) return res.status(404).send({ message: 'User not found' })
		console.log(req.file)

		const {
			fullName,
			age,
			dob,
			email,
			phoneNumber,
			pincode,
			city,
			address,
			gender,
		} = req.body
		user.profile = {
			fullName,
			age: parseInt(age),
			dob,
			email,
			phoneNumber: parseInt(phoneNumber),
			pincode: parseInt(pincode),
			city,
			address,
			gender,
			profileImage: req.file ? req.file.path : null,
		}
		res.status(200).send({
			message: 'Account information saved successfully',
		})
	})
})

// Protected route
app.get('/protected', (req, res) => {
	const token = req.headers['authorization']
	if (!token) return res.status(403).send({ message: 'No token provided' })

	jwt.verify(token, SECRET_KEY, (err, decoded) => {
		if (err)
			return res
				.status(500)
				.send({ message: 'Failed to authenticate token' })
		res.status(200).send({
			message: 'This is a protected route',
			user: decoded,
		})
	})
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
