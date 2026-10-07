const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const interviewReportModel = require("../models/interviewReport.model")

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
}

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [ { username }, { email } ]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET.trim(),
            { expiresIn: "1d" }
        )

        res.cookie("token", token, COOKIE_OPTIONS)

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to register user"
        })
    }
}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET.trim(),
            { expiresIn: "1d" }
        )

        res.cookie("token", token, COOKIE_OPTIONS)
        return res.status(200).json({
            message: "User logged in successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to log in"
        })
    }
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token", COOKIE_OPTIONS)

        return res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to log out"
        })
    }
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password")

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to fetch user details"
        })
    }
}

/**
 * @name deleteAccountController
 * @description Delete user account, associated interview reports, and invalidate token.
 * @access private
 */
async function deleteAccountController(req, res) {
    try {
        const userId = req.user.id

        // 1. Delete all interview reports generated by this user
        await interviewReportModel.deleteMany({ user: userId })

        // 2. Blacklist current token if present
        const token = req.cookies.token
        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        // 3. Delete user account
        await userModel.findByIdAndDelete(userId)

        // 4. Clear auth cookie
        res.clearCookie("token", COOKIE_OPTIONS)

        return res.status(200).json({
            message: "Account and associated data deleted successfully."
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to delete account"
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    deleteAccountController
}