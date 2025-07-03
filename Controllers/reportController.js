const reports = require('../Model/reportModel')
// create report
exports.createReportController = async (req, res) => {
    console.log("inside saveReportController");
    try {
        const { user, subject, message, status } = req.body
        const newReport = new reports({
            user, subject, message, status
        })
        await newReport.save()
        res.status(200).json(newReport)
    }
    catch (err) {
        res.status(401).json(errr)
    }

}
