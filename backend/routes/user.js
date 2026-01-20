const express = require(`express`);
const { authMiddleware } = require(`../middlewares/authMiddleware`);
const {
  getUserProfile,
  getHistorySimpleTextModel,
  getHistoryClinicalTextModel,
  getHistoryImageModel,
  getHistoryCombinedModel
} = require(`../controllers/userController`);
const { getChatbotAiResponse } = require('../controllers/chatbotController');
 
const router = express.Router();

router.get(`/profile`, authMiddleware, getUserProfile);
router.get(`/history/simpleTextModel`, authMiddleware, getHistorySimpleTextModel);
router.get(`/history/clinicalTextModel`, authMiddleware, getHistoryClinicalTextModel);
router.get(`/history/imageModel`, authMiddleware, getHistoryImageModel);
router.get(`/history/combinedModel`, authMiddleware, getHistoryCombinedModel);

router.post('/pcos-chatbot', authMiddleware, getChatbotAiResponse);

module.exports = router;