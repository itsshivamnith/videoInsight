const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const ignoreDirs = ['node_modules', '.git'];

function walkAndReplace(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (ignoreDirs.includes(item)) continue;
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            walkAndReplace(fullPath);
        } else if (stat.isFile()) {
            // extensions to check
            const ext = path.extname(fullPath).toLowerCase();
            const allowedExts = ['.js', '.jsx', '.json', '.html', '.md', '.txt', '.env', '.example', '.xml', ''];
            
            // Allow files with no extension or specific extensions, except images and binaries
            if (!allowedExts.includes(ext) && !['.yaml', '.toml'].includes(ext)) {
                // skip binary/images
                 if(['.ico','.png','.svg','.jpg','.jpeg'].includes(ext)) continue;
            }
            
            try {
                let content = fs.readFileSync(fullPath, 'utf8');
                let newContent = content
                    .replace(/VideoInsight/g, 'VideoInsight')
                    .replace(/videoinsight/g, 'videoinsight')
                    .replace(/VIDEOINSIGHT/g, 'VIDEOINSIGHT')
                    .replace(/VideoInsight/gi, 'VideoInsight');
                
                // Specific text changes
                // Page titles, Tagline...
                newContent = newContent.replace(/VideoInsight - AI Video Summarizer/g, 'VideoInsight - AI Video Summarizer');
                
                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                    console.log(`Updated: ${fullPath}`);
                }
            } catch(e) {
                // Not a text file or read error
            }
        }
    }
}

walkAndReplace(projectRoot);
