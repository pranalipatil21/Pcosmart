const express = require('express');
const SimpleDataTest = require('../models/SimpleDataTest');
const ClinicalDataTest = require('../models/ClinicalDataTest');
const ImageDataTest = require('../models/ImageDataTest');
// const CombinedDataTest = require('../models/CombinedDataTest');

const getUserProfile = async (req, res) => {
}

const getHistorySimpleTextModel = async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        return res.status(400).json({ message: "User is not logged in" });
    }
    try {
        // Fetch history data from database based on userId 
        const historyData = await SimpleDataTest.find({ userId: userId }).sort({ createdAt: -1 });
        return res.status(200).json({ history: historyData });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
}

const getHistoryClinicalTextModel = async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        return res.status(400).json({ message: "User is not logged in" });
    }
    try {
        // Fetch history data from database based on userId 
        const historyData = await ClinicalDataTest.find({ userId: userId }).sort({ createdAt: -1 });
        return res.status(200).json({ history: historyData });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
}

const getHistoryImageModel = async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        return res.status(400).json({ message: "User is not logged in" });
    }
    try {
        // Fetch history data from database based on userId 
        const historyData = await ImageDataTest.find({ userId: userId }).sort({ createdAt: -1 });
        return res.status(200).json({ history: historyData });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
}

const getHistoryCombinedModel = async (req, res) => {
}

module.exports = {
    getUserProfile,
    getHistorySimpleTextModel,
    getHistoryClinicalTextModel,
    getHistoryImageModel,
    getHistoryCombinedModel
};