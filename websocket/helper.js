'user strict';
const DB = require('./db');

class Helper
{
	constructor(app)
	{
		this.db = DB;
	}
	async loginUser(userid,socketid){
		try 
		{				
			return await this.db.query(`UPDATE user SET socketId = ?, userActive = ?  WHERE id = ?`, [socketid,'1',userid]);
		} 		
		catch (error) 
		{
			return null;
		}	
	}
	async addUserMessage(fromUserId,toUserId,message){
		try 
		{	
			return await this.db.query(`INSERT INTO message(fromUserId,toUserId,message,status) VALUES(?,?,?,?,)`, [fromUserId,toUserId,message,'0']);
		} 		
		catch (error) 
		{
			return null;
		}	
	}
	async getUserDetailBySocketId(socketId){
		try 
		{	
			return await this.db.query(`SELECT * FROM user WHERE socketId = ?`, [socketId]);
		} 		
		catch (error) 
		{
			return null;
		}	
	}
	async updateMessageStatus(fromUserId,toUserId){
		try 
		{	
			return await this.db.query(`UPDATE message SET status = ?  WHERE fromUserId = ? AND toUserId = ?`, ['1',fromUserId,toUserId]);
		} 		
		catch (error) 
		{
			return null;
		}	
	}

	async logoutUser(userid){
		try 
		{	
			return await this.db.query(`UPDATE user SET socketId = ?, userActive = ? WHERE id = ?`, ['','0',userid]);
		} 		
		catch (error) 
		{
			return null;
		}	
	}

}
module.exports = new Helper();