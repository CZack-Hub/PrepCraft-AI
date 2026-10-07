import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, jobDescriptionFile, selfDescription, resumeFile }) => {
    try {
        const formData = new FormData()
        if (jobDescription) {
            formData.append("jobDescription", jobDescription)
        }
        if (jobDescriptionFile) {
            formData.append("jobDescriptionFile", jobDescriptionFile)
        }
        if (selfDescription) {
            formData.append("selfDescription", selfDescription)
        }
        if (resumeFile) {
            formData.append("resume", resumeFile)
        }

        const response = await api.post("/api/interview/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })

        return response.data
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to generate interview strategy")
    }
}

/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`)
        return response.data
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to fetch interview report")
    }
}

/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/api/interview/")
        return response.data
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to fetch interview reports")
    }
}

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    try {
        const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
            responseType: "blob"
        })

        return response.data
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to generate resume PDF")
    }
}

/**
 * @description Service to delete an interview report by interviewId.
 */
export const deleteInterviewReport = async (interviewId) => {
    try {
        const response = await api.delete(`/api/interview/report/${interviewId}`)
        return response.data
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to delete interview report")
    }
}