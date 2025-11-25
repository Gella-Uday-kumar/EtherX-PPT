import ipfsService from './src/ipfsService.js';

async function testIPFS() {
  try {
    console.log('Testing IPFS connection...');
    
    // Test JSON upload
    const testData = {
      title: 'Test Presentation',
      slides: [
        { id: 1, content: 'Hello World' }
      ],
      timestamp: new Date().toISOString()
    };
    
    console.log('Uploading JSON to IPFS...');
    const result = await ipfsService.uploadJSON(testData);
    console.log('✅ JSON uploaded successfully:', result);
    
    // Test file upload
    const testFileContent = Buffer.from('This is a test file content');
    console.log('Uploading file to IPFS...');
    const fileResult = await ipfsService.uploadFile(testFileContent, 'test.txt');
    console.log('✅ File uploaded successfully:', fileResult);
    
  } catch (error) {
    console.error('❌ IPFS test failed:', error.message);
    console.error('Full error:', error);
  }
}

testIPFS();