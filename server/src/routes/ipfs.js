import express from 'express';
import fetch from 'node-fetch';
import ipfsService from '../ipfsService.js';

const router = express.Router();

router.post('/save', async (req, res) => {
  try {
    const presentationData = req.body;
    
    // Check if IPFS is configured
    if (!process.env.IPFS_API_KEY || process.env.IPFS_API_KEY === 'your-pinata-api-key') {
      console.log('⚠️ IPFS not configured, saving locally');
      return res.json({
        success: true,
        ipfsHash: 'local-' + Date.now(),
        message: 'Presentation saved locally (IPFS not configured)'
      });
    }
    
    const result = await ipfsService.uploadJSON(presentationData);
    
    res.json({
      success: true,
      ipfsHash: result.IpfsHash,
      message: 'Presentation saved to IPFS'
    });
  } catch (error) {
    console.error('IPFS save error:', error);
    res.json({
      success: true,
      ipfsHash: 'local-fallback-' + Date.now(),
      message: 'Saved locally (IPFS unavailable)'
    });
  }
});

router.get('/load/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    if (hash.startsWith('local-')) {
      return res.json({
        success: false,
        error: 'Local presentations cannot be loaded'
      });
    }
    
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