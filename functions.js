// Set of Instructions NO FORWARDING

// R-type instructions:  = Opcode (6) + rs (5) + rt (5) + rd (5) + (5) + func (16)
// OR = ORI rt,rs,immediate = 001101 + rs + rt + immediate
// DSUBU = DSUBU rd,rs,rt = 000000 + rs + rt + rd + 00000 + 101111 
// SLT = SLT rd,rs,rt = 000000 + rs + rt + rd + 00000 + 101010
// NOP = 0000 0000 0000 0000 0000 0000 0000 0000 

// I-type instructions: = Opcode (6) + rs (5) + rt (5) + (16)
// BNE = BNE rs,rt,offset = 000101 + rs + rt + offset 
// LD = LD rt, offset(base) =  110111 + base + rt + offset 
// SD = SD rt, offset(base) = 111111 + base + rt + offset 
// DADDIU = DADDIU rt,rs,immediate = 011001  + rs + rt + immediate


// J-type instruction:  = Opcode (6) + instr_index (26)
// J = J instr_index = 000010 + instr_index 

// SAMPLE CODES
// LD R1, 2000(R1)
// DADDU R31, R30, R29
// LD R1, 1000(R2)
// DADDU R5, R6, R8

/* 	TEAM NOTE: Please follow the conventions below for easier reading
*	Variables/Parameters (Camel Case): 	var myVarName
*	Functions/Classes (Pascal Case)		function my_function_name(myParmameterName)
*
*/

var R = new Array();
var Rstring;
var listofInstructions = new Array();
var labels = new Array();
var cycleList = new Array();
var memoryList = new Array();
var currentCycle = new Cycle();
var executionOutput = new Array();

/** Utility Functions */
function add_zeroes_left(n, totalDigits)
{
    if(!totalDigits){
	totalDigits = 2;
	}
    n = String(n);
    while (n.length < totalDigits)
	n = "0"+n;
    return n;
}

function binary_to_decimal(string)
{
	string = string.replace(/\s+/g, '');
	var binary = string.split("");
	
	var decimal = 0;
    var exponent = 0;
    var digit;
	for(var i = 15; i !== -1; i--)
	{
        digit = parseInt(binary[i]);
		decimal += digit*Math.pow(2,exponent);
        exponent++;
	}	
	return decimal;
}

function decimal_to_binary(string)
{
	return parseInt(string,10).toString(2);
}

function binary_to_hex(string)
{
	var block;
	var i = 0;
	var start = 0;
	var end = 4;
	var hex = "";
	while(i < 8)
	{
		block = string.substring(start,end);
		if(i % 4 === 0)
		{
			hex += " ";
		}
		switch(block)
		{
			case "0000": hex += "0"; break;
			case "0001": hex += "1"; break;
			case "0010": hex += "2"; break;
			case "0011": hex += "3"; break;
			case "0100": hex += "4"; break;
			case "0101": hex += "5"; break;
			case "0110": hex += "6"; break;
			case "0111": hex += "7"; break;
			case "1000": hex += "8"; break;
			case "1001": hex += "9"; break;
			case "1010": hex += "A"; break;
			case "1011": hex += "B"; break;
			case "1100": hex += "C"; break;
			case "1101": hex += "D"; break;
			case "1110": hex += "E"; break;
			case "1111": hex += "F"; break;
		}
		start += 4;
		end += 4;
		i++;
	}
	return hex;
}

function regex_check_syntax(string)
{
	var re = /^((L[0-9](:)(\s))?(OR|DSUBU|SLT|BNE|LD|SD|DADDIU|J)\s((L[0-9]{1,2})|(R[0-9]{1,2}))(,\s((L[0-9]{1,2})|([0-9]{4}\((R[0-9]{1,2})\))|((R[0-9]{1,2})(,\s(R[0-9]{1,2}|\#[0-9A-F]{4}))?))))|(NOP)?$/m;
	var check = re.exec(string);

	return check;
}

function get_reg_num(string)
{
	if(string !== undefined){
		var newstr = string.replace("R","");
		newstr = newstr.replace(",","");
		return parseInt(newstr);
	}

	return "";
}

function save_register_values()
{
	for(var i = 1; i <= 31; i++)
	{
		Rstring = "R".concat(i.toString());
		R[i-1] = document.getElementById(Rstring).value.replace(/\s+/g, '');
	}
	// alert(binary_to_decimal(R[30]));
}

/*End of Utility Functions */

/** Data Containers */
function Cycle(instructions)
{
	var IF_TR = "", IF_NPC = "", PC = "0";
	var ID_IR = "", ID_A = "", ID_B = "", ID_IMM = "", ID_NPC = "";
	var EX_IR = "", EX_ALU = "", EX_B = "", EX_cond = "0";
	var MEM_IR = "", MEM_ALU = "", MEM_LMD = "", MEM_TARGET = "";
	var affectedRegister = "";
	
	var IF_instr, ID_instr, EX_instr, MEM_instr, WB_instr;
	
	registers = new Array();
	this.instructions = instructions;
}

function Label(label,PC)
{	
	this.label = label;
	this.PC = PC;
}

function Memory(address,value)
{
	this.address = address;
	this.value = value;
}	

function ExecutionOutput()
{
	var op = "";
	var RS = "";
	var RT = "";
	var preOp = "";
	var postOp = "";
	var offset;
	var label = "none";
}

function InstructData(operation, type, MIPSOperation)
{
	this.operation = operation;
	this.type = type;
	this.MIPSOperation = MIPSOperation;
	var binary = "";
	var PC = 0;
	var label = "";
	var opcode = "";
	var currentState = "";
	var registersUsed;
	var registerDestination = "";
}
/** End of Data Containers */

// function to analyze code
function parse_code()
{
	var logsDiv = document.getElementById('mips-log-area'); // grab div containing logs
	save_register_values(); // save register values entered by user
	var text = document.getElementById("codearea").value; // grab code from code area
	var lines = text.split(/\r\n|\r|\n/g); //as if i figured this out by myself... (JG: Did you? :>)
	var buffer = new Array();
	var instruction = new Array();
	var currentPC = 0;
	var isValidSyntax = true;
	var current = "";
	
	logsDiv.value += "[INFO] (Code Analysis) In Progress.\n";
	
	// house keeping: flush previous parsing
	while(currentCycle.length)
	{
		currentCycle.pop();
	}
	while(listofInstructions.length)
	{
		listofInstructions.pop();
	}
	while(executionOutput.length)
	{
		executionOutput.pop();
	}
		
	// populate new list of instructions
	for(var i = 0; i < lines.length; i++)
	{
		instruction.push(lines[i]);
	}
	
	// turn stack upside-down
	while(buffer.length)
	{
		instruction.push(buffer.pop()); 
	}
	
	// get labels
	for (var i = 0; i < instruction.length; i++)
	{
		var string = instruction[i];
		if(regex_check_syntax(string) && isValidSyntax)
		{
			if(string.indexOf(':') != - 1)
			{
				var tokens = string.split(" ");
				var label = new Label(tokens[0].replace(":",""), currentPC); // get Label: value and corresponding PC
				labels.push(label);
			}
		} 
		else 
		{
			isValidSyntax = false;
			logsDiv.value += "[ERROR] '" + string + "' is not a valid syntax.\n";
		}
		currentPC += 4;
	}
	currentPC = 0; // reset counter


	// once all instructions are successfully parsed, get instructions and type of each
	if(isValidSyntax)
	{
		for (var i = 0; i < instruction.length; i++)
		{
			current = "";
			var currentoperation;
			var string = instruction[i];
			var tokens = regex_check_syntax(string);		
			
			if(string.length !== 0)
			{	
				if(tokens[0] !== "NOP")
				{
					switch(tokens[5])
					{
						case "OR" : currentoperation = new InstructData(tokens[5], "R-TYPE","ALU"); break;
						case "DSUBU" : currentoperation = new InstructData(tokens[5], "R-TYPE", "ALU"); break;
						case "SLT" : currentoperation = new InstructData(tokens[5], "R-TYPE","ALU"); break;

						case "BNE" : currentoperation = new InstructData(tokens[5], "I-TYPE","BRANCH"); break;
						case "LD" : currentoperation = new InstructData(tokens[5], "I-TYPE","LOADSTORE"); break;
						case "SD" : currentoperation = new InstructData(tokens[5], "I-TYPE","LOADSTORE"); break;
						case "DADDIU" : currentoperation = new InstructData(tokens[5], "I-TYPE","ALU"); break;

						case "J" : currentoperation = new InstructData(tokens[5],"J-TYPE","NEITHER"); break;
					}
				}
				else
				{
					currentoperation = new InstructData(tokens[0], "R-TYPE","");
				}

			}
			
			currentoperation.registersUsed = new Array(); // reset/init registersUsed
			
			// INTERPRET Instructions
			if(currentoperation.type === "J-TYPE")
			{
				current += "000010";
				
				currentoperation.label = tokens[6];
				reference = tokens[6].replace("L","");
				reference = parseInt(reference.replace(":",""));
				
				reference = reference - (currentPC + 4);
				
				if(reference !== 0)
				{
					reference /= 4;
					
					current += add_zeroes_left(decimal_to_binary(reference), 26);
				}
				
				currentoperation.binary = current;
				currentoperation.PC = currentPC;
				currentoperation.currentState = "";
				listofInstructions.push(currentoperation);
			}
			
			else if(currentoperation.type === "R-TYPE")
			{
				if(currentoperation.operation === "NOP")
				{
					current += add_zeroes_left("", 32);

					// store binary opcode				
					currentoperation.binary = current;
					// store current PC
					currentoperation.PC = currentPC;
					// initialize current state
					currentoperation.currentState = "";
					// add to list of instructions to execute
					listofInstructions.push(currentoperation);
				}
				else
				{
					// first part of entire opcode
					current += "000000";
					
					// add register number to opcode and save to list of registers used
					//RS
					currentoperation.registersUsed.push(get_reg_num(tokens[15]));
					current += add_zeroes_left(decimal_to_binary(get_reg_num(tokens[15])),5);
					
					//RT
					currentoperation.registersUsed.push(get_reg_num(tokens[17]));
					current += add_zeroes_left(decimal_to_binary(get_reg_num(tokens[17])),5);

					//RD
					currentoperation.registersUsed.push(get_reg_num(tokens[6]));
					current += add_zeroes_left(decimal_to_binary(get_reg_num(tokens[6])),5);
					currentoperation.registerDestination = get_reg_num(tokens[6]);

					// add additional part of entire opcode
					current += "00000";
					
					// add last part of R-type opcodes			
					var funcCode = 0;
					switch(currentoperation.operation)
					{
						case "OR": current += add_zeroes_left(decimal_to_binary("37"),6); break;
						case "SLT": current += add_zeroes_left(decimal_to_binary("42"),6); break;
						case "DSUBU": current += add_zeroes_left(decimal_to_binary("47"),6); break;
						default: current+= add_zeroes_left(decimal_to_binary("0"), 6); break;
					}
					
					// store binary opcode				
					currentoperation.binary = current;
					// store current PC
					currentoperation.PC = currentPC;
					// initialize current state
					currentoperation.currentState = "";
					// add to list of instructions to execute
					listofInstructions.push(currentoperation);
				}
			}
			
			else if(currentoperation.type === "I-TYPE")
			{
				// add first part of binary opcode
				switch(currentoperation.operation)
				{
					case "BNE": current += add_zeroes_left(decimal_to_binary("5"),6); break;
					case "DADDIU": current += add_zeroes_left(decimal_to_binary("25"),6); break;
					case "LD": current += add_zeroes_left(decimal_to_binary("55"),6); break;
					case "SD": current += add_zeroes_left(decimal_to_binary("63"),6); break;
					default: ;
				}	
				
				// add unique part in between the binary opcode
				if(currentoperation.operation === "BNE")
				{
					currentoperation.registersUsed.push(get_reg_num(tokens[15]));
					current += add_zeroes_left(decimal_to_binary(get_reg_num(tokens[15])),5) //RS
					currentoperation.registerDestination = get_reg_num(tokens[15]);
					
					current += "00000";
					
					// label
					currentoperation.label = tokens[10];
					var reference = parseInt(tokens[10].replace("L",""));
					
					reference = reference - (currentPC + 4);
					
					if(reference !== 0)
					{
						
						reference /= 4;
						
						current += add_zeroes_left(decimal_to_binary(reference),16);
					}
					
					// save values
					currentoperation.binary = current;
					currentoperation.PC = currentPC;
					currentoperation.currentState = "";
					listofInstructions.push(currentoperation);
					
				}
				
				else if(currentoperation.operation === "DADDIU")
				{
					
					currentoperation.registersUsed.push(get_reg_num(tokens[15]));
					current += add_zeroes_left(decimal_to_binary(get_reg_num(tokens[15])),5);
					
					currentoperation.registersUsed.push(get_reg_num(tokens[6]));
					current += add_zeroes_left(decimal_to_binary(get_reg_num(tokens[6])),5);
					currentoperation.registerDestination = get_reg_num(tokens[6]);
				
					//offset
					var offsetInt = tokens[17].replace("#","");
					
					offsetInt = offsetInt.split("");	
					
					var fillZeroes = 4 - offsetInt.length;
					
					while(fillZeroes !== 0)
					{
						current += add_zeroes_left("0",4);
						fillZeroes /= 4;
					}
					
					for(var j = 0; j < offsetInt.length; j++)
					{
						current += add_zeroes_left(decimal_to_binary(offsetInt[j]),4);
					}
					
					currentoperation.binary = current;
					currentoperation.PC = currentPC;
					currentoperation.currentState = "";
					listofInstructions.push(currentoperation);					
				}
				
				else if(currentoperation.operation === "LD" || currentoperation.operation === "SD")
				{					
					var offsetPair = tokens[10].split("\(");
					
					// base
					//var register = ;
					
					currentoperation.registersUsed.push(get_reg_num(offsetPair[1].replace(")","")));
					current += add_zeroes_left(decimal_to_binary(get_reg_num(offsetPair[1].replace(")",""))),5);
					
					// dest
					
					//register = ;
					currentoperation.registersUsed.push(get_reg_num(tokens[6]));
					current += add_zeroes_left(decimal_to_binary(get_reg_num(tokens[6])),5);
					currentoperation.registerDestination = get_reg_num(tokens[6]);
					
					//offset
					
					var offsetInt = offsetPair[0];
					offsetInt = offsetInt.split("");
					
					
					var fillZeroes = 4 - offsetInt.length;
					
					while(fillZeroes !== 0)
					{
						current += add_zeroes_left("0",4);
					}
					
					for(var j = 0; j < offsetInt.length; j++)
					{
						current += add_zeroes_left(decimal_to_binary(offsetInt[j]),4);
					}
					
					currentoperation.binary = current;
					currentoperation.currentState = "";
					currentoperation.PC = currentPC;
					listofInstructions.push(currentoperation);
				}
						
			}
			
			currentCycle = new Cycle(listofInstructions);
			currentCycle.IF_instr = instruction[i];
			cycleList.push(currentCycle);
			currentPC += 4;
		}
	} 
	else 
	{
		logsDiv.value += "[INFO] (Code Analysis) Done. Nothing else to parse.\n";
	}
	//alert("listofInstructions.length : " + listofInstructions.length);
	logsDiv.value += "[INFO] Successfully parsed "+ listofInstructions.length + " lines of instructions \n";
	
	// execute instructions after parsing
	execute_mips_code(listofInstructions);
	
}

// function to execute code (Run, Forrest, Run!)
function execute_mips_code(listofInstructions){
	var currentPC = 0;
	var i = 0;
	var stillRunning = true; // Run, Forrest, Run!
	
	while(currentPC == 0 || currentPC <= listofInstructions[listofInstructions.length - 1].PC)
	{
		var currentInstr = listofInstructions[i];
		var newOperation = new ExecutionOutput();
		var memory;
		
		switch(currentInstr.operation)
		{
			case "J" : 
				newOperation.op = "J";
				var foundlabel = false;
				var i = 0;
				var label;
				while(!foundlabel)
				{
					if(labels[i].label == currentInstr.label)
					{
						foundlabel = true;
						label = labels[i];
						newOperation.label = label;
					}
					i++;
				}
				i = label.PC/4;
				currentPC = label.PC;
				executionOutput.push(newOperation);
				break;
			case "BNE" :
				newOperation.op = "BNE";
				if(currentInstr.registersUsed[0] !== currentInstr.registersUsed[1])
				{
					var foundlabel = false;
					var i = 0;
					var label;
					while(!foundlabel)
					{
						if(labels[i].label == currentInstr.label)
						{
							foundlabel = true;
							label = labels[i];
							newOperation.label = label;
						}
						i++;
					}

					i = label.PC/4;
					currentPC = label.PC;
				}
				else
				{
					i++;
					currentPC += 4;
				}
				executionOutput.push(newOperation);
				break;
			case "DADDIU" : 
				newOperation.op = "DADDIU";
				newOperation.RS = currentInstr.registersUsed[0]; 
				newOperation.preOp = currentInstr.registersUsed[1];
			    newOperation.offset = currentInstr.binary.substring(12);
				R[newOperation.preOp] = perform_DADDIU(R[newOperation.RS],newOperation.offset); 
				newOperation.postOp = R[newOperation.preOp];
				executionOutput.push(newOperation);
				currentPC += 4;
				i++;
				break;
			case "LD" : 
				newOperation.op = "LD";
				newOperation.RS = currentInstr.registersUsed[0]; 
				newOperation.RT = currentInstr.registersUsed[1];
			    newOperation.offset = currentInstr.binary.substring(12);
				R[newOperation.RT] = perform_LD(R[newOperation.RS],newOperation.offset); 
				newOperation.postOp = R[newOperation.preOp];
				executionOutput.push(newOperation);
				currentPC += 4;
				i++;
				break;
			case "SD" :
				newOperation.op = "SD";
				newOperation.RS = currentInstr.registersUsed[0]; 
				newOperation.RT = currentInstr.registersUsed[1];
			    newOperation.offset = currentInstr.binary.substring(12);
				memory = new Memory((parseInt(newOperation.offset) + parseInt(R[newOperation.RS])).toString(),R[newOperation.RT]); 
				memoryList.push(memory);
				executionOutput.push(newOperation);
				currentPC += 4;
				i++;
				break;
			case "OR" :
				newOperation.op = "OR";
				newOperation.RS = currentInstr.registersUsed[0];
				newOperation.RT = currentInstr.registersUsed[1];
				newOperation.preOp = currentInstr.registersUsed[2];
				R[newOperation.preOp] = perform_OR(R[newOperation.RS],R[newOperation.RT]);
				newOperation.postOp = R[newOperation.preOp];
				executionOutput.push(newOperation);
				currentPC += 4;
				i++;
				break;
			case "SLT" : 
				newOperation.op = "SLT";
				newOperation.RS = currentInstr.registersUsed[0];
				newOperation.RT = currentInstr.registersUsed[1];
				newOperation.preOp = currentInstr.registersUsed[2];
				R[newOperation.preOp] = perform_SLT(R[newOperation.RS],R[newOperation.RT]);
				newOperation.postOp = R[newOperation.preOp];
				executionOutput.push(newOperation);
				currentPC += 4;
				i++;
				break; 
			case "DSUBU" :
				newOperation.op = "DSUBU";
				newOperation.RS = currentInstr.registersUsed[0];
				newOperation.RT = currentInstr.registersUsed[1];
				newOperation.preOp = currentInstr.registersUsed[2];
				R[newOperation.preOp] = perform_SUBU(R[newOperation.RS],R[newOperation.RT]);
				newOperation.postOp = R[newOperation.preOp];
				executionOutput.push(newOperation);
				currentPC += 4;
				i++;
				break;
			case "NOP" :
				newOperation.op = "NOP";
				executionOutput.push(newOperation)
				currentPC += 4;
				i++;
				break;
			default:
				i++;
				break;
				// do nothing if no cases matched
		}
	}
}

/** Display Functions */
// former opcode window display
function display_opcode_window()
{
	var div = document.getElementById('mips-opcodes-area');
	// div.value = "";
	
	for(var i = 0; i < listofInstructions.length; i++)
	{
		div.value = div.value + listofInstructions[i].PC + " " + listofInstructions[i].operation + " : " +  binary_to_hex(listofInstructions[i].binary) + " " + listofInstructions[i].binary + "\n";
	}
}

// former pipeline
function display_pipeline_window()
{
	// var pipelineWindow = window.open("", "PipelineWindow", "width=700, height=400");

 	// pipelineWindow.document.clear();
 	var div = document.getElementById('panel_pipeline');
	var instr = listofInstructions;
	var currentop = executionOutput;
	
	// TODO: Calculate width of table depending on number of instructions
	var map = "<table border = '1' width='500' height='100' style='font-size: 18px; font-weight: 800;'>";
	
 	 //displays cycle counts
	map += "<tr>";
	cellcount = cycleList.length+5;
	/*if(listofInstructions.length-5 > 0){
		cellcount += listofInstructions.length;
	}*/
 	for(var h = 0; h < cellcount ; h++)
 	{
    	map += "<td>" + h + "</td>";
  	}
  	map += "</tr>"

	decreasecells = 1;
	var i = 0;
	while(i < listofInstructions.length)
	{
		map += "<tr>";
		
		map += "<td width ='450px'>" + cycleList[i].IF_instr + "</td>";
		
		
		console.log("cellcount : " + cellcount);
		console.log("cells decreased: " + decreasecells);
		
		if(i > 0 && instr[i].currentState== "")
		{
      		for(var a=0; a<i; a++)
      		{
        		if(a<=i)
        		{
          			map += "<td width = '30px'>" + "&nbsp" + "</td>";
				}
     		}
  		}
		
		for(var j=0; j < cellcount - decreasecells; j++)
		{
			switch(instr[i].currentState)
			{
				case "" : instr[i].currentState = "IF"; break;
				case "IF": instr[i].currentState = "ID"; break;
				case "ID": instr[i].currentState = "EX"; break;
				case "EX": instr[i].currentState = "MEM"; break;
				case "MEM": instr[i].currentState = "WB"; break;
				case "WB": instr[i].currentState = " "; break;
				default: break;
			}

			map += "<td width = '30px'>" + instr[i].currentState + "</td>";
		}
		
		if(currentop[i] !== undefined && currentop[i].op !== undefined){
			if(currentop[i].op == "BNE" || currentop[i].op == "J")
			{
				i = currentop.PC/4;
			}
			else
			{
				i++;
			}	
		}
		
		decreasecells++;
		map += "</tr>";
	}
	
	div.innerHTML=map;
	// pipelineWindow.document.write(map);
}

function display_output_window()
{
	/*var outputWindow = window.open("", "OutputWindow", "width=700, height=400");
	
	var currentInstr;
	
	//alert(executionOutput.length);
	
	var i = 0;
	while(i < executionOutput.length)
	{
		output = executionOutput[i];
		//alert(output);
		switch(output.op)
		{
			case "J":
			outputWindow.document.write("Jumped to " + output.label);
			break;
			case "BNE":
			if(output.label != "none")
			{
				outputWindow.document.write(output.op + " -- Register R" + output.RS.toString() + " is equal to zero, no action performed.");
			}
			else outputWindow.document.write(output.op + " -- Register R" + output.RS.toString() + "is not equal to zero, branched to " + output.label);
			break;
			case "DADDIU" : 
			outputWindow.document.write(output.op + " -- Register: R" + output.RS.toString() + " = " + binary_to_decimal(R[output.RS]) + " and offset " + output.offset.toString() + ". Value " + binary_to_decimal(newOperation.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "LD" :
			outputWindow.document.write(output.op + " -- Value from memory address [" + (parseInt(binary_to_decimal(R[output.RS])) + parseInt(output.offset)).toString() + " stored to R" + output.RT.toString());
			break;
			case "SD" :
			outputWindow.document.write(output.op + " -- Value of R" + output.RT.toString() + " stored to memory address [" + (parseInt(binary_to_decimal(R[output.RS])) + parseInt(output.offset)).toString() + ".");
			break;
			case "OR" : 
			outputWindow.document.write(output.op + " -- Registers: R" + output.RS.toString() + " = " + binary_to_decimal(R[output.RS]) + " R" + output.RT.toString() + " = " + binary_to_decimal(R[output.RT]) + " -- Value " + binary_to_decimal(output.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "SLT" :
			outputWindow.document.write(output.op + " -- Registers: R" + output.RS.toString() + " = " + binary_to_decimal(R[output.RS]) + " R" + output.RT.toString() + " = " + binary_to_decimal(R[output.RT]) + " -- Value " + binary_to_decimal(output.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "DSUBU" : 
			outputWindow.document.write(output.op + " -- Registers: R" + output.RS.toString() + " = " + binary_to_decimal(R[output.RS]) + " R" + output.RT.toString() + " = " + binary_to_decimal(R[output.RT]) + " -- Value " + binary_to_decimal(output.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "NOP" : 
			outputWindow.document.write(output.op + " -- Registers: R" + output.RS.toString() + " = " + binary_to_decimal(R[output.RS]) + " R" + output.RT.toString() + " = " + binary_to_decimal(R[output.RT]) + " -- Value " + binary_to_decimal(output.postOp) + " stored to R" + output.preOp.toString());
			break;
		}
		outputWindow.document.write("<br>");
		i++;
	}*/
			
	var logsDiv = document.getElementById('mips-log-area');
	logsDiv.value = "";
}

function display_registers_window()
{
	var registerswindow = window.open("", "RegistersWindow", "width=700, height=400");
	var instr = listofInstructions;
	var map = "<table border = '1'>";
	registerswindow.document.clear();


	//displays cycle counts
	map += "<tr>";
	for(var h = 0; h< listofInstructions.length+5; h++)
	{
	map += "<td>" + h + "</td>";
	}
	map += "</tr>"

	for(var i = 0; i < listofInstructions.length; i++)
	{
	map += "<tr>";
	map += "<td width='150px'>" + cycleList[i].IF_instr + "</td>";  //prints the current instruction
	map += "<td width = '3opx'>" + "PC = " + cycleList[i].PC + "&#10;" + "NPC = " + cycleList[i].NPC  + "</td>";
	}
	map += "</tr>";
	registerswindow.document.write(map);
}
/** End of Display Functions */