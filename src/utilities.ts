// Utilties File

// importing File System module of node
const fs = require('fs');

// // File logging 
export class Logger {
	private stream: any = fs.createWriteStream('file.txt');

	file(log_message: string) {
		// this.stream.write('Hello ', log_message);
		// this.fs.createWriteStream('log.txt', { flags: 'a' });
		// this.fs.write('new entry\n');
		console.log("Logging file: ", log_message);
	}

	readFile(){

	}

	closeLogFile(){
		var stream = fs.createWriteStream('./file.txt');
		stream.on('finish', () => {
			console.log('All the data is transmitted');
		});
	}
}