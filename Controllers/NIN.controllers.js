const NINModel = require('../Models/NIN')

exports.createNIN = async (req, res) => {
    try {
        const { nin, firstName, lastName, dob } = req.body;

        // Ensure non of the fields are undefined
        if (!nin || !firstName || !lastName || !dob) {
            return res.status(400).json({error: "All fields are required"});
        }

        //Ensure non of the fields are empty strings
        const tNin = nin.trim();
        const tFirstName = firstName.trim();
        const tLastName = lastName.trim();
        const tDob = dob.trim();
        if (!tNin || !tFirstName || !tLastName || !tDob) {
            return res.status(400).json({error: "Non of the fields can be an empty string"});
        }

        //Ensure nin is 11 digits
        const validNIN = /^\d{11}$/.test(tNin);

        if (!validNIN) {
            return res.status(400).json({error: "NIN must have only 11 digits"})
        }

        //Ensure nin does not already exist in the database
        const existingNIN = await NINModel.exists({nin: tNin});

        if (existingNIN) {
            return res.status(400).json({error: "NIN already exists for another user, Please provide a different one"});
        }

        //Ensure dob is a valid date
        const isDate = new Date(tDob);

        if (isNaN(isDate.getTime()) || isDate.getTime() > Date.now()) {
            return res.status(400).json({error: "Provide a valid dob"});
        }

        const data = await NINModel.create({
            nin: tNin,
            firstName: tFirstName,
            lastName: tLastName,
            dob: tDob,
        });

        return res.status(200).json({
            message: "NIN Profile Created Successfully",
            response: data
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

exports.validateNIN = async (req, res) => {
    try {
        const { nin } = req.body;

        //Ensure nin is not undefined
        if (!nin) {
            return res.status(400).json({error: "NIN must be provided"});
        }

        //Ensure nin is not an empty string
        const tNin = nin.trim();

        if (!tNin) {
            return res.status(400).json({error: "NIN cannot be an empty string"});
        }

        //Ensure nin is 11 digits
        const validNIN = /^\d{11}$/.test(tNin);

        if (!validNIN) {
            return res.status(400).json({error: "NIN provided is not valid"});
        }

        //Check if profile for the NIN exists
        const validProfile = await NINModel.findOne({nin: tNin});

        if (!validProfile) {
            return res.status(400).json({error: "NIN is not registered. Kindly register your NIN"});
        }

        return res.status(200).json({
            message: "NIN Verified!!",
            response: validProfile
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}