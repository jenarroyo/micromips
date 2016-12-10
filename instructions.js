/** COMMANDS LIST (SET B) */
// R-TYPE
function perform_OR(registerOne,registerTwo)
{
	return add_zeroes_left(decimal_to_binary(binary_to_decimal(registerOne) | binary_to_decimal(registerTwo)),16);	
}
function perform_SUBU(registerOne,registerTwo)
{
	return add_zeroes_left(decimal_to_binary(binary_to_decimal(registerOne) - binary_to_decimal(registerTwo)),16);	
}
function perform_SLT(registerOne,registerTwo)
{
	if(binary_to_decimal(registerOne) < binary_to_decimal(registerTwo))
	{
		return 1;
	}
	else return 0;
}
function perform_NOP()
{
	// Do nothing
}

// I-TYPE 
function perform_BNE(register,label)
{
	//TODO: Previously BNEZ, get new logic
	return label << 2;	
}
function perform_LD(register,offset)
{
	var foundmemory = false;
	var i = 0;
	while(!foundmemory)
	{
		if(memoryList.length > 0){
			if(memoryList[i].address == (parseInt(binary_to_decimal(register)) + parseInt(offset)).toString())
			{
				return memoryList[i].value;
			}
		}else{
			return -1;
		}
	}
	return -1;
}
function perform_SD(register)
{
	return register;	
}
function perform_DADDIU(register,offset)
{
	return add_zeroes_left(decimal_to_binary(binary_to_decimal(register) + offset),16);	
}

// J-TYPE
function perform_J(label)
{
	return label;	
}
/** END OF COMMANDS LIST */