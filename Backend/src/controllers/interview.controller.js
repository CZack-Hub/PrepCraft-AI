const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription = "", jobDescription = "" } = req.body

        let finalJobDescription = jobDescription ? jobDescription.trim() : ""
        const jdUpload = req.files?.jobDescriptionFile?.[0]
        if (jdUpload) {
            try {
                const parsedJd = await (new pdfParse.PDFParse(Uint8Array.from(jdUpload.buffer))).getText()
                const extractedJd = parsedJd?.text ? parsedJd.text.trim() : ""
                if (extractedJd) {
                    finalJobDescription = finalJobDescription
                        ? `${finalJobDescription}\n\n${extractedJd}`
                        : extractedJd
                }
            } catch (fileErr) {
                return res.status(400).json({
                    message: "Failed to parse Job Description PDF: " + (fileErr.message || "Invalid PDF file.")
                })
            }
        }

        if (!finalJobDescription.trim()) {
            return res.status(400).json({
                message: "Please provide a job description (paste text or upload a PDF)."
            })
        }

        let resumeText = ""
        const resumeUpload = req.files?.resume?.[0] || req.file
        if (resumeUpload) {
            try {
                const parsed = await (new pdfParse.PDFParse(Uint8Array.from(resumeUpload.buffer))).getText()
                resumeText = parsed?.text || ""
            } catch (fileErr) {
                return res.status(400).json({
                    message: "Failed to parse PDF resume: " + (fileErr.message || "Invalid PDF file.")
                })
            }
        }

        if (!resumeText.trim() && !selfDescription.trim()) {
            return res.status(400).json({
                message: "Please provide either a resume PDF or a self-description."
            })
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription: finalJobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription: finalJobDescription,
            ...interViewReportByAi
        })

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to generate interview report."
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to fetch interview report."
        })
    }
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to fetch interview reports."
        })
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        // Verify the report belongs to the authenticated user
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        return res.send(pdfBuffer)
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to generate resume PDF."
        })
    }
}

/**
 * @description Controller to delete an interview report by interviewId.
 */
async function deleteInterviewReportController(req, res) {
    try {
        const { interviewId } = req.params

        const deletedReport = await interviewReportModel.findOneAndDelete({
            _id: interviewId,
            user: req.user.id
        })

        if (!deletedReport) {
            return res.status(404).json({
                message: "Interview report not found or already deleted."
            })
        }

        return res.status(200).json({
            message: "Interview strategy deleted successfully.",
            interviewId
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to delete interview report."
        })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    deleteInterviewReportController
}