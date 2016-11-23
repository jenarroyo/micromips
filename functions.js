// Set of Instructions NO FORWARDING

// R-type instructions:  = Opcode (6) + rs (5) + rt (5) + rd (5) + (5) + func (16)
// OR = ORI rt,rs,immediate = 001101 + rs + rt + immediate
// DSUB = DSUBU rd,rs,rt = 000000 + rs + rt + rd + 00000 + 101111 
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


var R = new Array();
var Rstring;
var listofInstructions = new Array();
var labels = new Array();
var cycleList = new Array();
var memoryList = new Array();
var currentCycle = new Cycle();
var executionOutput = new Array();
saveRegisterValues();

function addZerosLeft(n, totalDigits)
{
    if(!totalDigits){
	totalDigits = 2;
	}
    n = String(n);
    while (n.length < totalDigits)
	n = "0"+n;
    return n;
}

function saveRegisterValues()
{
	for(var i = 1; i <= 31; i++)
	{
		Rstring = "R".concat(i.toString());
		R[i-1] = document.getElementById(Rstring).value.replace(/\s+/g, '');
	}
	alert(binaryToDecimal(R[30]));
}
	
function binaryToDecimal(string)
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

function decimalToBinary(string)
{
	return parseInt(string,10).toString(2);
}

function binaryToHex(string)
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

function regexSyntaxCheck(string)
{
	var re = /^(L[0-9](:)(\s))?(J|LD|SD|OR|DADDU|DSUBU|ANDI|DADDIU|DSLLV|SLT|BNEZ)\s((L[0-9]{1,2})|(R[0-9]{1,2}))(,\s((L[0-9]{1,2})|([0-9]{4}\((R[0-9]{1,2})\))|((R[0-9]{1,2})(,\s(R[0-9]{1,2}|\#[0-9A-F]{4}))?)))?$/m;
	var check = re.exec(string);

	return check;
}

function getRegNum(string)
{
	var newstr = string.replace("R","");
	newstr = newstr.replace(",","");
	
	return parseInt(newstr);
}

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

function execOutput()
{
	var op = "";
	var RS = "";
	var RT = "";
	var preOp = "";
	var postOp = "";
	var offset;
	var label = "none";
}

function instructData(operation, type, MIPSOperation)
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

function doIF()
{
	var previousCycle = cycleList[cycleList.length() - 1];
	var instr;
	
	for(var i = 0; i < listofInstructions.length; i++)
	{
		if(listofInstructions[i].PC = currentPC)
		{
			instr = listofInstructions[i];
			break;
		}
	}
	
	currentCycle.IF_instr = instr;
	
	// IF/ID.IR <- Mem[PC]
	
	currentCycle.IF_IR =  binaryToHex(instr.binary);
	
	// IF/ID.NPC, PC <- (if EX/MEM cond {EX/MEM.ALUOutput} else {PC+4}
	
	if(currentCycle.EX_cond == "0")
	{
		currentCycle.IF_NPC = addZerosLeft(binaryToHex(decimalToBinary(toString(currentPC))),16);
	} 
	else
	{
		currentCycle.IF_NPC = previousCycle.EX_ALU;
	}
	
}

function doID()
{
	var previousCycle = cycleList[cycleList.length() - 1];
	var instr = previousCrcle.IF_instr;
	
	var previousIR = previousCycle.IF_IR;
	var binaryofIR = currentCycle.IF_instr.binary;
	
	// ID/EX.A <- REG[6..10]; 
    currentCycle.ID_A += parseInt(binaryOfIR.substring(6, 10),2);
        
    // ID/EX.B <- REG[11..15];
    currentCycle.ID_B += parseInt(binaryOfIR.substring(11, 15),2);
        
    // ID/EX.Imm <- (SIGN EXTENSION)##IF/ID.IR[16-31]
    // shortcut [SIGN EXTEND]##IR[4,7]
    currentCycle.ID_IMM += parseInt(binaryOfIR.substring(16, 31),2);
     
    // ID/EX.NPC <- IF/ID.NPC
    currentCycle.ID_NPC = previousCycle.IF_NPC;
        
    // ID/EX.IR <- IF/ID.IR
    currentCycle.ID_IR = previousCycle.IF_IR;
	
}

function doEX()
{
	var previousCycle = cycleList[cycleList.length() - 1];
	var EX_instr = previousCrcle.ID_instr;
	
	currentCycle.EX_instr = EX_instr;
	
	if(EX_instr.MIPSOperation == "ALU")
	{
        
        /*** ALU ***/
        var ALUoutput = "";
        
        // EX/MEM.IR <- ID/EX.IR
        currentCycle.EX_IR = previousCycle.ID_IR;

        // EX/MEM.cond <- 0
        currentCycle.EX_cond = "0";
        
        // =========== ALU OPERATIONS ================
        // EX/MEM.ALUOutput <- ID/EX.A func ID/EX.B
        //OR
        // EX/MEM.ALUOutput <- ID/EX.A op ID/EX.Imm
        
        var valueOfA = parseInt(previousCycle.ID_A);
        var valueOfB = parseInt(previousCycle.ID_B);
        var valueOfImm = parseInt(previousCycle.ID_IMM);
            
        if(EX_instr.operation == "ANDI")
        {
            currentCycle.EX_ALU = performANDI(valueOfA,valueOfB);
        } 
        else if(EX_instr.operation == "OR")
        {
            currentCycle.EX_ALU = performOR(valueOfA,valueOfImm);
        } 
        else if(EX_instr.operation == "DADDU")
        {
            var total = valueOfA + valueOfB;
            currentCycle.EX_ALU = total + "";
        } 
        else if(EX_instr.operation == "DADDIU")
        {
            var total = valueOfA + valueOfImm;
            currentCycle.EX_ALU = total + "";  
        } 
        else if(EX_instr.operation == "DSUBU")
        {
            var total = valueOfA - valueOfB;
            currentCycle.EX_ALU = total + "";
        } 
        else if(EX_instr.operation == "DSLLV")
        {
            currentCycle.EX_ALU = performDSLLV(valueOfA, valueOfB);
        } 
        else if(EX_instr.operation == "SLT")
        {
            if(valueOfA < valueOfB) 
            {
                currentCycle.EX_cond = "1";
            } 
            else 
            {
            	currentCycle.EX_cond = "0";
            }
        } 
        
    } 
    else  if(EX_instr.MIPSOperation == "LOADSTORE")
    {
        /*** Load and Store ***/

        var StorageOutput = "";
        // EX/MEM.IR <- ID/EX.IR
        currentCycle.EX_IR = previousCycle.ID_IR;

        // EX/MEM.ALUOutput <- ID/EX.A + ID/EX.Imm
        var A = parseInt(previousCycle.ID_A,16);
        var Imm = parseInt(previousCycle.ID_IMM,10);
        StorageOutput = (((A+Imm)*4).toString(16));        
        currentCycle.EX_ALU = StorageOutput;

        // EX/MEM.cond <- 0
        currentCycle.EX_cond = "0";

        // EX/MEM.B <- ID/EX.B
        currentCycle.EX_B = previousCycle.ID_B;
    
    } 
    else if(EX_instr.MIPSOperation == "BRANCH")
    {
        /*** Branch ***/

        var BranchOutput = "";
        // EX/MEM.ALUOutput <- ID/EX.NPC + ID/EX.Imm
        var NPC = parseInt(previousCycle.getID_NPC(),16);
        var Imm = parseInt(previousCycle.getID_IMM(),10);
        BranchOutput = (((NPC+Imm)*4).toString(16));        
        currentCycle.EX_ALU = BranchOutput;

        // EX/MEM.cond <- (ID/EX.A op 0)
        currentCycle.EX_cond = "0";
    
    } 
    else 
    {
        //JUMP?
        currentCycle.EX_cond = "0";
    }
}

function doMEM()
{
	var previousCycle = cycleList[cycleList.length() - 1];
	var MEM_instr = previousCrcle.EX_instr;
	currentCycle.MEM_instr = MEM_instr;
	
	if(MEM_instr.MIPSOperation == "ALU")
	{
		currentCycle.MEM_IR = previousCycle.EX_IR;
		currentCycle.MEM_ALU = previousCycle.EX_ALU;
	}
	
	else if(MEM_instr.MIPSOperation == "LOADSTORE")
	{
		currentCycle.MEM_IR = previousCycle.EX_IR;
		
		if(MEM_instr.operation == "LD")
		{
			currentCycle.MEM_LMD = previousCycle.EX_IR;
		}
		
		else 
		{
			currentCycle.EX_ALU = previousCycle.EX_B;
		}
	
	} 
	else 
	{
		;
	}
}

function doWB()
{
    var previousCycle = cycleList[cycleList.length() - 1];
    var WB_instr = previousCycle.MEM_instr;
    currentCycle.WB_instr = WB_instr;
    
    if(WB_instr.MIPSOperation == "ALU")
    {
        /*** ALU ***/

        // Regs[MEM/WB.IR[16..20] <- MEM/WB.ALUOutput 
        //OR 
        // Regs[MEM/WB.IR[11..15] <- MEM/WB.ALUOutput

        R[getRegNum(registerDestination)] = previousCycle.MEM_ALU; //put MEM_ALU on register destination

    } 
    else if(WB_instr.MIPSOperation == "LOADSTORE")
    {
        /*** Load & Store ***/

        // Regs[MEM/WB.IR[11..15] <- MEM/WB.LMD

        R[getRegNum(registerDestination)] = previousCycle.MEM_LMD; // put MEM_LMD on register destination
    
    } 
    else 
    {
         /*** ELSE ***/
        
    }
}

// COMMANDS LIST
function performADD(registerOne,registerTwo)
{
	return addZerosLeft(decimalToBinary(binaryToDecimal(registerOne) + binaryToDecimal(registerTwo)),16);	
}

function performADDI(register,offset)
{
	return addZerosLeft(decimalToBinary(binaryToDecimal(register) + offset),16);	
}

function performSUB(registerOne,registerTwo)
{
	return addZerosLeft(decimalToBinary(binaryToDecimal(registerOne) - binaryToDecimal(registerTwo)),16);	
}

function performAND(register,offset)
{
	return addZerosLeft(decimalToBinary(binaryToDecimal(register) & offset),16);	
}

function performOR(registerOne,registerTwo)
{
	return addZerosLeft(decimalToBinary(binaryToDecimal(registerOne) | binaryToDecimal(registerTwo)),16);	
}

function performDSLLV(registerOne,registerTwo)
{
	return addZerosLeft(decimalToBinary(binaryToDecimal(registerOne) << binaryToDecimal(registerTwo.substring(10))),16);	
}

function performSLT(registerOne,registerTwo)
{
	if(binaryToDecimal(registerOne) < binarytoDecimal(registerTwo))
	{
		return 1;
	}
	else return 0;
}

function performLD(register,offset)
{
	var foundmemory = false;
	var i = 0;
	while(!foundmemory)
	{
		if(memoryList[i].address == (parseInt(binaryToDecimal(register)) + parseInt(offset)).toString())
		{
			return memoryList[i].value;
		}
	}
	return -1;
}

function performSD(register)
{
	return register;	
}

function performBNEZ(register,label)
{
	return label << 2;	
}

function performJ(label)
{
	return label;	
}

// END OF COMMANDS LIST
	
function parse()
{
	var text = document.getElementById("codearea").value;
	var lines = text.split(/\r\n|\r|\n/g); //as if i figured this out by myself
	var buffer = new Array();
	var instruction = new Array();
	var currentPC = 0;
	var validsyntax = true;
	var current = "";
	
	
	//flush previous parsing
	while(currentCycle.length)
	{
		currentCycle.pop()
	}
	
	while(listofInstructions.length)
	{
		listofInstructions.pop()
	}
	
	while(executionOutput.length)
	{
		executionOutput.pop()
	}
		
		
	for(var i = 0; i < lines.length; i++)
	{
		instruction.push(lines[i]);
	}
	
	while(buffer.length)
	{
		instruction.push(buffer.pop()); // turn stack upside-down
	}
	
	// get labels
	
	for (var i = 0; i < instruction.length; i++)
	{
		var string = instruction[i];
		if(regexSyntaxCheck(string) && validsyntax)
		{
			if(string.indexOf(':') != - 1)
			{
				var tokens = string.split(" ");
				var label = new Label(tokens[0].replace(":",""),currentPC);
			}
		} 
		else 
		{
			validsyntax = false;
			alert("'" + string + "' is not a valid syntax.");
		}
		currentPC += 4;
	}
	
	currentPC = 0;
		
	// get instructions and give type
	
	if(validsyntax)
	{
	
		for (var i = 0; i < instruction.length; i++)
		{
			current = "";
			var currentoperation;
			
			var string = instruction[i];
			var tokens = regexSyntaxCheck(string);		
			
			if(string.length !== 0)
			{	
				switch(tokens[4])
				{
					case "J" : currentoperation = new instructData(tokens[4],"J-TYPE","NEITHER"); break;
					case "BNEZ" : currentoperation = new instructData(tokens[4], "I-TYPE","BRANCH"); break;
					case "ANDI" : currentoperation = new instructData(tokens[4], "I-TYPE","ALU"); break;
					case "DADDIU" : currentoperation = new instructData(tokens[4], "I-TYPE","ALU"); break;
					case "LD" : currentoperation = new instructData(tokens[4], "I-TYPE","LOADSTORE"); break;
					case "SD" : currentoperation = new instructData(tokens[4], "I-TYPE","LOADSTORE"); break;
					case "DSLLV" : currentoperation = new instructData(tokens[4], "R-TYPE","ALU"); break;
					case "OR" : currentoperation = new instructData(tokens[4], "R-TYPE","ALU"); break;
					case "SLT" : currentoperation = new instructData(tokens[4], "R-TYPE","ALU"); break;
					case "DADDU" : currentoperation = new instructData(tokens[4], "R-TYPE","ALU"); break;
					case "DSUBU" : currentoperation = new instructData(tokens[4], "R-TYPE", "ALU"); break;
				}
			}
			
			currentoperation.registersUsed = new Array();
			
			// INTERPRET
			
			if(currentoperation.type === "J-TYPE")
			{
				current += "000010";
				
				currentoperation.label = tokens[5];
				reference = tokens[5].replace("L","");
				reference = parseInt(reference.replace(":",""));
				
				reference = reference - (currentPC + 4);
				
				if(reference !== 0)
				{
					reference /= 4;
					
					current += addZerosLeft(decimalToBinary(reference), 26);
					
				}
				
				currentoperation.binary = current;
				
				currentoperation.PC = currentPC;
				
				currentoperation.currentState = "";
				
				listofInstructions.push(currentoperation);
			}
			
			else if(currentoperation.type === "R-TYPE")
			{
				current += "000000";
				
				//RS
				currentoperation.registersUsed.push(getRegNum(tokens[14]));
				current += addZerosLeft(decimalToBinary(getRegNum(tokens[14])),5)
				
				//RT
				currentoperation.registersUsed.push(getRegNum(tokens[16]));
				current += addZerosLeft(decimalToBinary(getRegNum(tokens[16])),5)

				//RD
				currentoperation.registersUsed.push(getRegNum(tokens[5]));
				current += addZerosLeft(decimalToBinary(getRegNum(tokens[5])),5)
				currentoperation.registerDestination = getRegNum(tokens[5]);

				current += "00000";
				
				var funcCode = 0;
				switch(currentoperation.operation)
				{
					case "DSLLV": current += addZerosLeft(decimalToBinary("20"),6); break;
					case "OR": current += addZerosLeft(decimalToBinary("37"),6); break;
					case "SLT": current += addZerosLeft(decimalToBinary("42"),6); break;
					case "DADDU": current += addZerosLeft(decimalToBinary("45"),6); break;
					case "DSUBU": current += addZerosLeft(decimalToBinary("47"),6); break;
					default: ;
				}
				
				currentoperation.binary = current;
				
				currentoperation.PC = currentPC;
				
				currentoperation.currentState = "";
				
				listofInstructions.push(currentoperation);
				
			}
			
			else if(currentoperation.type === "I-TYPE")
			{
				switch(currentoperation.operation)
				{
					case "BNEZ": current += addZerosLeft(decimalToBinary("5"),6); break;
					case "ANDI": current += addZerosLeft(decimalToBinary("12"),6); break;
					case "DADDIU": current += addZerosLeft(decimalToBinary("25"),6); break;
					case "LD": current += addZerosLeft(decimalToBinary("55"),6); break;
					case "SD": current += addZerosLeft(decimalToBinary("63"),6); break;
					default: ;
				}	
				
				if(currentoperation.operation === "BNEZ")
				{
					currentoperation.registersUsed.push(getRegNum(tokens[14]));
					current += addZerosLeft(decimalToBinary(getRegNum(token[14])),5) //RS
					currentoperation.registerDestination = getRegNum(tokens[14]);
					
					current += "00000";
					
					// label
					
					currentoperation.label = tokens[9];
					var reference = parseInt(tokens[9].replace("L",""));
					
					reference = reference - (currentPC + 4);
					
					if(reference !== 0)
					{
						
						reference /= 4;
						
						current += addZerosLeft(decimalToBinary(reference),16);
					}
					
					currentoperation.binary = current;
					
					currentoperation.PC = currentPC;
					
					currentoperation.currentState = "";
				
					listofInstructions.push(currentoperation);
					
				}
				
				else if(currentoperation.operation === "ANDI" || currentoperation.operation === "DADDIU")
				{
					
					currentoperation.registersUsed.push(getRegNum(tokens[14]));
					current += addZerosLeft(decimalToBinary(getRegNum(tokens[14])),5)
					
					currentoperation.registersUsed.push(getRegNum(tokens[5]));
					current += addZerosLeft(decimalToBinary(getRegNum(tokens[5])),5)
					currentoperation.registerDestination = getRegNum(tokens[5]);
				
					//offset
					
					var offsetInt = tokens[16].replace("#","");
					
					offsetInt = offsetInt.split("");	
					
					var fillZeroes = 4 - offsetInt.length;
					
					while(fillZeroes !== 0)
					{
						current += addZerosLeft("0",4);
					}
					
					for(var j = 0; j < offsetInt.length; j++)
					{;
						current += addZerosLeft(decimalToBinary(offsetInt[j]),4);
					}
					
					currentoperation.binary = current;
					
					currentoperation.PC = currentPC;
					
					currentoperation.currentState = "";
				
					listofInstructions.push(currentoperation);					
				}
				
				else if(currentoperation.operation === "LD" || currentoperation.operation === "SD")
				{					
					var offsetPair = tokens[9].split("\(");
					
					// base
					//var register = ;
					
					currentoperation.registersUsed.push(getRegNum(offsetPair[1].replace(")","")));
					current += addZerosLeft(decimalToBinary(getRegNum(offsetPair[1].replace(")",""))),5);
					
					// dest
					
					//register = ;
					currentoperation.registersUsed.push(getRegNum(tokens[5]));
					current += addZerosLeft(decimalToBinary(getRegNum(tokens[5])),5);
					currentoperation.registerDestination = getRegNum(tokens[5]);
					
					//offset
					
					var offsetInt = offsetPair[0];
					offsetInt = offsetInt.split("");
					
					
					var fillZeroes = 4 - offsetInt.length;
					
					while(fillZeroes !== 0)
					{
						current += addZerosLeft("0",4);
					}
					
					for(var j = 0; j < offsetInt.length; j++)
					{;
						current += addZerosLeft(decimalToBinary(offsetInt[j]),4);
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
		alert("Nothing to parse.");
	}
	
	currentPC = 0;
	//alert("listofInstructions.length : " + listofInstructions.length);
	
	// execute instructions
	
	var i = 0;
	var stillRunning = true;
	
	while(currentPC == 0 || currentPC <= listofInstructions[listofInstructions.length - 1].PC)
	{
		//alert("currentPC : " + currentPC + " listofInstructions[listofInstructions.length - 1].PC : " + listofInstructions[listofInstructions.length - 1].PC);
		var currentInstr = listofInstructions[i];
		//alert(currentInstr);
		var newOperation = new execOutput();
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
			case "BNEZ" :
			newOperation.op = "BNEZ";
			if(currentInstr.registersUsed[0] !== 0)
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
			case "ANDI" :
			newOperation.op = "ANDI";
			newOperation.RS = currentInstr.registersUsed[0]; 
			newOperation.preOp = currentInstr.registersUsed[1];
		    newOperation.offset = currentInstr.binary.substring(12);
			R[newOperation.preOp] = performAND(R[newOperation.RS],newOperation.offset); 
			newOperation.postOp = R[newOperation.preOp];
			executionOutput.push(newOperation);
			currentPC += 4;
			i++;
			break;
			case "DADDIU" : 
			newOperation.op = "DADDIU";
			newOperation.RS = currentInstr.registersUsed[0]; 
			newOperation.preOp = currentInstr.registersUsed[1];
		    newOperation.offset = currentInstr.binary.substring(12);
			R[newOperation.preOp] = performADDI(R[newOperation.RS],newOperation.offset); 
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
			R[newOperation.RT] = performLD(R[newOperation.RS],newOperation.offset); 
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
			memory = new Memory((parseInt(offset) + parseInt(R[newOperation.RS])).toString(),R[newOperation.RT]); 
			memoryList.push(memory);
			executionOutput.push(newOperation);
			currentPC += 4;
			i++;
			break;
			case "DSLLV" :
			newOperation.op = "DSLLV";
			newOperation.RS = currentInstr.registersUsed[0];
			newOperation.RT = currentInstr.registersUsed[1];
			newOperation.preOp = currentInstr.registersUsed[2];
			R[newOperation.preOp] = performDSLLV(R[newOperation.RS],R[newOperation.RT]);
			newOperation.postOp = R[newOperation.preOp];
			executionOutput.push(newOperation);
			currentPC += 4;
			i++;
			break;
			case "OR" :
			newOperation.op = "OR";
			newOperation.RS = currentInstr.registersUsed[0];
			newOperation.RT = currentInstr.registersUsed[1];
			newOperation.preOp = currentInstr.registersUsed[2];
			R[newOperation.preOp] = performOR(R[newOperation.RS],R[newOperation.RT]);
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
			R[newOperation.preOp] = performSLT(R[newOperation.RS],R[newOperation.RT]);
			newOperation.postOp = R[newOperation.preOp];
			executionOutput.push(newOperation);
			currentPC += 4;
			i++;
			break;
			case "DADDU" : 
			newOperation.op = "DADDU";
			newOperation.RS = currentInstr.registersUsed[0];
			newOperation.RT = currentInstr.registersUsed[1];
			newOperation.preOp = currentInstr.registersUsed[2];
			R[newOperation.preOp] = performADD(R[newOperation.RS],R[newOperation.RT]);
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
			R[newOperation.preOp] = performSUB(R[newOperation.RS],R[newOperation.RT]);
			newOperation.postOp = R[newOperation.preOp];
			executionOutput.push(newOperation);
			currentPC += 4;
			i++;
			break;
		}
				
		
		
	}
	
	alert("Successfully parsed "+ listofInstructions.length + " lines of instructions");

}

function displayOpcodeWindow()
{
	var opcodeWindow = window.open("", "OpCodeWindow", "width=500, height=300");
	opcodeWindow.document.clear();
	
	for(var i = 0; i < listofInstructions.length; i++)
	{
		opcodeWindow.document.write(listofInstructions[i].PC + " " + listofInstructions[i].operation + " : " +  binaryToHex(listofInstructions[i].binary) + " " + listofInstructions[i].binary);
			opcodeWindow.document.write("<br>");
	}
}

function displayPipelineWindow()
{
	var pipelineWindow = window.open("", "PipelineWindow", "width=700, height=400");

 	pipelineWindow.document.clear();

	var instr = listofInstructions;
	var currentop = executionOutput;
	
	var map = "<table border = '1'>";
	
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
		
		map += "<td width ='150px'>" + cycleList[i].IF_instr + "</td>";
		
		
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
		
		for(var j = 0; j < cellcount - decreasecells; j++)
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
		
		if(currentop[i].op == "BNEZ" || currentop[i].op == "J")
		{
			i = currentop.PC/4;
		}
		else i++;
		
		decreasecells++;
		map += "</tr>";
	}
	
	pipelineWindow.document.write(map);
}

function displayOutputWindow()
{
	var outputWindow = window.open("", "OutputWindow", "width=700, height=400");
	
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
			case "BNEZ":
			if(output.label != "none")
			{
				outputWindow.document.write(output.op + " -- Register R" + output.RS.toString() + " is equal to zero, no action performed.");
			}
			else outputWindow.document.write(output.op + " -- Register R" + output.RS.toString() + "is not equal to zero, branched to " + output.label);
			break;
			case "ANDI" :
			outputWindow.document.write(output.op + " -- Register: R" + output.RS.toString() + " = " + binaryToDecimal(R[output.RS]) + " and offset " + output.offset.toString() + ". Value " + binaryToDecimal(newOperation.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "DADDIU" : 
			outputWindow.document.write(output.op + " -- Register: R" + output.RS.toString() + " = " + binaryToDecimal(R[output.RS]) + " and offset " + output.offset.toString() + ". Value " + binaryToDecimal(newOperation.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "LD" :
			outputWindow.document.write(output.op + " -- Value from memory address [" + (parseInt(binaryToDecimal(R[output.RS])) + parseInt(output.offset)).toString() + " stored to R" + output.RT.toString());
			break;
			case "SD" :
			outputWindow.document.write(output.op + " -- Value of R" + output.RT.toString() + " stored to memory address [" + (parseInt(binaryToDecimal(R[output.RS])) + parseInt(output.offset)).toString() + ".");
			break;
			case "DSLLV" :
			outputWindow.document.write(output.op + " -- Registers: R" + output.RS.toString() + " = " + binaryToDecimal(R[output.RS]) + " R" + output.RT.toString() + " = " + binaryToDecimal(R[output.RT]) + " -- Value " + binaryToDecimal(output.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "OR" : 
			outputWindow.document.write(output.op + " -- Registers: R" + output.RS.toString() + " = " + binaryToDecimal(R[output.RS]) + " R" + output.RT.toString() + " = " + binaryToDecimal(R[output.RT]) + " -- Value " + binaryToDecimal(output.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "SLT" :
			outputWindow.document.write(output.op + " -- Registers: R" + output.RS.toString() + " = " + binaryToDecimal(R[output.RS]) + " R" + output.RT.toString() + " = " + binaryToDecimal(R[output.RT]) + " -- Value " + binaryToDecimal(output.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "DADDU" : 
			outputWindow.document.write(output.op + " -- Registers: R" + output.RS.toString() + " = " + binaryToDecimal(R[output.RS]) + " R" + output.RT.toString() + " = " + binaryToDecimal(R[output.RT]) + " -- Value " + binaryToDecimal(output.postOp) + " stored to R" + output.preOp.toString());
			break;
			case "DSUBU" : 
			outputWindow.document.write(output.op + " -- Registers: R" + output.RS.toString() + " = " + binaryToDecimal(R[output.RS]) + " R" + output.RT.toString() + " = " + binaryToDecimal(R[output.RT]) + " -- Value " + binaryToDecimal(output.postOp) + " stored to R" + output.preOp.toString());
			break;
		}
		outputWindow.document.write("<br>");
		i++;
	}
			
}

function displayRegistersWindow()
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
