/** MIPS Cycles */
function do_IF(currentPC)
{
    var previousCycle = cycleList[cycleList.length - 1];
    var instr;
    
    for(var i = 0; i < listofInstructions.length; i++)
    {
        if(listofInstructions[i].PC == currentPC)
        {
            instr = listofInstructions[i];
            break;
        }
    }
    
    if(listofInstructions[i-1] != undefined){
        var tempRegs = listofInstructions[i-1].registersUsed;
        var currentRegs = listofInstructions[i].registersUsed;

        if(tempRegs.indexOf(currentRegs[0]) != -1 || tempRegs.indexOf(currentRegs[1]) != -1){
            stallDataHazard = true;
        }
    }

    currentCycle.IF_instr = instr;
    
    // IF/ID.IR <- Mem[PC]
    currentCycle.IF_IR =  binary_to_hex(instr.binary);
    
    // IF/ID.NPC, PC <- (if EX/MEM cond {EX/MEM.ALUOutput} else {PC+4}
    // if(currentCycle.EX_cond == "0")
    // {
        currentCycle.IF_NPC = add_zeroes_left(binary_to_hex(decimal_to_binary((currentPC+4).toString(16))),16);
    // } 
    // else
    // {
    //  currentCycle.IF_NPC = previousCycle.EX_ALU;
    // }
}

function do_ID()
{
    var previousCycle = cycleList[cycleList.length - 1];
    var instr = previousCycle.IF_instr;
    
    var previousIR = previousCycle.IF_IR;
    var binaryOfIR = currentCycle.IF_instr.binary;
    
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

function do_EX()
{
    var previousCycle = cycleList[cycleList.length - 1];
    var EX_instr = previousCycle.ID_instr;
    
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
            
        if(EX_instr.operation == "OR")
        {
            currentCycle.EX_ALU = perform_OR(valueOfA,valueOfImm);
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
        else if(EX_instr.operation == "NOP"){}
        
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

function do_MEM()
{
    var previousCycle = cycleList[cycleList.length - 1];
    var MEM_instr = previousCycle.EX_instr;
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

    }
}

function do_WB()
{
    var previousCycle = cycleList[cycleList.length - 1];
    var WB_instr = previousCycle.MEM_instr;
    currentCycle.WB_instr = WB_instr;
    
    if(WB_instr.MIPSOperation == "ALU")
    {
        /*** ALU ***/

        // Regs[MEM/WB.IR[16..20] <- MEM/WB.ALUOutput 
        //OR 
        // Regs[MEM/WB.IR[11..15] <- MEM/WB.ALUOutput

        R[get_reg_num(registerDestination)] = previousCycle.MEM_ALU; //put MEM_ALU on register destination

    } 
    else if(WB_instr.MIPSOperation == "LOADSTORE")
    {
        /*** Load & Store ***/

        // Regs[MEM/WB.IR[11..15] <- MEM/WB.LMD

        R[get_reg_num(registerDestination)] = previousCycle.MEM_LMD; // put MEM_LMD on register destination
    
    } 
    else 
    {
         /*** ELSE ***/
    }
}
/** End of MIPS Cycles */