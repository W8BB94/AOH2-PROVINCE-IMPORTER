const express = require('express')
const fs = require('fs');
const linerdr = require('readline');
const chalk = require('chalk');

const app = express();

app.get('/', (req, res) => {
    res.send('hi there :)');
});

// We read from the folder where individual province files (0, 1, 2...) are stored
const pathSourceDir = './updatedProv'; 
const prefix = chalk.yellow.bold("[ProvinceToJSON]");

const inputlog = linerdr.createInterface({
    input: process.stdin,
    output: process.stdout
});

function plog(string) {
    console.log(`${prefix} ${string}`);
}

app.listen(1945, () => {
    plog('Turning on... \n\n')
    console.log(chalk.blueBright(`
//////////////////////////////////////////////
                                        
 mmmmmm    mmmmmm    mm    mm  mm    mm 
 ##""""##  ##""""##  ##    ##  ##    ## 
 ##    ##  ##    ##  ##    ##  ##    ## 
 #######   #######   ##    ##  ######## 
 ##    ##  ##  "##m  ##    ##  ##    ## 
 ##mmmm##  ##    ##  "##mm##"  ##    ## 
 """""""   ""    """   """"    ""    "" 
                                        
                                        

//////////////////////////////////////////////

AOH2 PROVINCE TO JSON CONVERTER v1.0.0
    `))

    console.log(chalk.magentaBright(`
    ${chalk.greenBright('[[ Instructions ]]')}

    1. Place individual files (0, 1, 2...) in ${chalk.yellow("'./updatedProv'")}.
    2. The tool will merge them into ${chalk.yellow("'mapAoC2_v2.txt'")} following the 2-line rule.
    3. Press ${chalk.yellowBright.bold('ENTER')} to begin.
    `))

    inputlog.question(`Press 'Enter' to start.`, () => {
        inputlog.close();

        if (fs.existsSync(pathSourceDir)) {
            // This array will hold the final lines (Line 1: X, Line 2: Y, Line 3: X...)
            let jsonOutput = [];
            
            try {
                // Sort files numerically so province '10' doesn't come before province '2'
                const files = fs.readdirSync(pathSourceDir).sort((a, b) => {
                    return parseInt(a) - parseInt(b);
                });

                plog(`${chalk.green.bold(files.length)} files detected. Processing...`);

                files.forEach((fileName) => {
                    const filePath = `${pathSourceDir}/${fileName}`;
                    
                    if (fs.lstatSync(filePath).isFile()) {
                        try {
                            let content = fs.readFileSync(filePath, 'utf8').trim();
                            
                            // Split by semicolon to separate X and Y lines
                            let parts = content.split(';');

                            // Logic to prevent "odd" data errors (like 213;3;134)
                            // We only want exactly two parts: X and Y.
                            if (parts.length >= 2) {
                                // Push X coordinates (Line 1 for this province)
                                jsonOutput.push(parts[0]);
                                // Push Y coordinates (Line 2 for this province)
                                jsonOutput.push(parts[1]);
                            } else {
                                plog(chalk.red(`[Skip] File '${fileName}' is missing a coordinate pair (no semicolon found).`));
                            }

                        } catch (readErr) {
                            plog(chalk.red(`Error reading file ${fileName}: ${readErr.message}`));
                        }
                    }
                });

                // Join the array into one big string separated by newlines
                const rawText = jsonOutput.join('\n');

                plog("Saving to mapAoC2_v2.txt...");
                // Write the string directly to a .txt file (NOT using JSON.stringify)
                fs.writeFileSync('./mapAoC2_v2.txt', rawText);
                
                plog(chalk.greenBright.bold(`\nMerge Complete! Total lines in JSON: ${jsonOutput.length}`));
                plog(chalk.cyan(`(Equivalent to ${jsonOutput.length / 2} provinces)`));

            } catch (dirErr) {
                plog(chalk.red(`Critical Error: ${dirErr.message}`));
            }

            plog(chalk.greenBright.bold('Exiting in 10 seconds.'));    
            setTimeout(() => {
                process.exit();
            }, 10000);

        } else {
            // Try-catch style fallback
            try {
                fs.mkdirSync(pathSourceDir);
                plog(chalk.yellow(`Created '${pathSourceDir}' folder. Please add files and restart.`));
            } catch(e) {
                plog(chalk.redBright("[ERROR] Could not find or create source folder."));
            }
        }
    });
});