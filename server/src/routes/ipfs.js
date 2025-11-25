import express from 'express';
import fetch from 'node-fetch';
import ipfsService from '../ipfsService.js';

const router = express.Router();

router.post('/save', async (req, res) => {
  try {
    const presentationData = req.body;
    const result = await ipfsService.uploadJSON(presentationData);
    
    res.json({
      success: true,
      ipfsHash: result.IpfsHash,
      message: 'Presentation saved to IPFS'
    });
  } catch (error) {
    console.error('IPFS save error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/load/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from IPFS');
    }
    
    const data = await response.json();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('IPFS load error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;