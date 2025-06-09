// 从图书馆服务器拉取座位菜单数据，并更新本地 sqlite 数据库中的 floor_info 和 room_info 表
const axios = require('axios');
const sqlite = require('../database/sqlite');
const dbService = require('./dbService');

const SEAT_MENU_URL = 'https://libseat.njfu.edu.cn/ic-web/seatMenu';
const SEAT_LIST_URL = 'https://libseat.njfu.edu.cn/ic-web/reserve'

async function updateSeatMenuDatabase() {
    try {
        const response = await axios.get(SEAT_MENU_URL);
        const seatData = response.data;

        if (seatData.code !== 0 || !Array.isArray(seatData.data)) {
            throw new Error('无效的seatMenu响应数据');
        }

        const floors = seatData.data;

        // 清空原有数据
        await sqlite.run('DELETE FROM room_info');
        await sqlite.run('DELETE FROM floor_info');

        for (const floor of floors) {
            const { id: floor_id, name: floor_name, remainCount, totalCount, children } = floor;

            // 插入楼层信息
            await sqlite.run(
                `INSERT INTO floor_info (floor_id, floor_name, remain_count, total_count)
                 VALUES (?, ?, ?, ?)`,
                [floor_id.toString(), floor_name, remainCount, totalCount]
            );

            // 插入房间信息
            for (const room of children || []) {
                const { id: room_id, name: room_name, remainCount, totalCount } = room;

                await sqlite.run(
                    `INSERT INTO room_info (room_id, room_name, remain_count, total_count, floor_id)
                     VALUES (?, ?, ?, ?, ?)`,
                    [room_id.toString(), room_name, remainCount, totalCount, floor_id.toString()]
                );
            }
        }

        console.log('数据库更新完成：floor_info 和 room_info');
        return {
            success: true,
            message: '数据库更新完成：floor_info 和 room_info'
        }
    } catch (error) {
        console.error('更新数据库时发生错误：', error.message);
        return {
            success: false,
            message: error.message
        }
    }
}

async function updateSeatCountDatabase() {
    try {
        const response = await axios.get(SEAT_MENU_URL);
        const seatData = response.data;

        if (seatData.code !== 0 || !Array.isArray(seatData.data)) {
            throw new Error('无效的seatMenu响应数据');
        }

        const floors = seatData.data;

        // 更新每个楼层的座位数量
        for (const floor of floors) {
            const { id: floor_id, remainCount, totalCount, children } = floor;

            // 更新楼层座位数量
            await sqlite.run(
                `UPDATE floor_info 
                 SET remain_count = ?, total_count = ?
                 WHERE floor_id = ?`,
                [remainCount, totalCount, floor_id.toString()]
            );

            // 更新房间座位数量
            for (const room of children || []) {
                const { id: room_id, remainCount, totalCount } = room;

                await sqlite.run(
                    `UPDATE room_info 
                     SET remain_count = ?, total_count = ?
                     WHERE room_id = ?`,
                    [remainCount, totalCount, room_id.toString()]
                );
            }
        }

        console.log('座位数量更新完成');
        return {
            success: true,
            message: '座位数量更新完成'
        }
    } catch (error) {
        console.error('更新座位数量时发生错误：', error.message);
        return {
            success: false,
            message: error.message
        }
    }
}

async function updateSeatListDatabase() {
    try {
        // 读取room_list表中的所有房间ID
        const roomList = sqlite.query(`SELECT room_id FROM room_info`);
        if (!roomList || roomList.length === 0) {
            throw new Error('room_list表中没有房间ID');
        }

        // 读取 token
        const settings = await dbService.getSystemSetting();
        const token = settings.token;

        // 清空原有数据
        await sqlite.run('DELETE FROM seat_list');

        for (const room of roomList) {
            console.log('正在更新房间ID为', room.room_id, '的座位列表');
            const response = await axios.get(SEAT_LIST_URL, {
                params: {
                    roomIds: room.room_id,
                    resvDates: new Date().toISOString().split('T')[0].replace(/-/g, ''), //获取当前日期 eg:20250527
                    sysKind: 8
                },
                headers: {
                    'Pragma': 'no-cache',
                    'lan': '1',
                    'Cookie': token
                }
            });
            const seatData = response.data;

            if (seatData.code !== 0 || !Array.isArray(seatData.data)) {
                throw new Error('无效的seatList响应数据');
            }

            const seats = seatData.data;
            const batchValues = [];
            const batchParams = [];

            // 收集所有座位数据
            for (const seat of seats) {
                const {
                    devId: seat_id,
                    devName: seat_name,
                    roomId: room_id,
                    roomName: room_name,
                    labId: floor_id,
                    labName: floor_name,
                } = seat;
                
                batchValues.push('(?, ?, ?, ?, ?, ?)');
                batchParams.push(
                    seat_id.toString(), 
                    seat_name, 
                    room.room_id.toString(), 
                    room_name, 
                    floor_id.toString(), 
                    floor_name
                );
            }
            
            // 批量插入当前房间的所有座位
            if (batchValues.length > 0) {
                const query = `INSERT INTO seat_list(seat_id, seat_name, room_id, room_name, floor_id, floor_name) VALUES ${batchValues.join(', ')}`;
                await sqlite.run(query, batchParams);
            }
        }
        
        // 更新has_init为true
        await sqlite.run('UPDATE system SET has_init = 1');
        return {
            success: true,
            message: '座位列表更新完成'
        }

    } catch (error) {
        console.error('更新座位列表时发生错误：', error.message);
        return {
            success: false,
            message: error.message
        }
    }
}


module.exports = {
    updateSeatMenuDatabase,
    updateSeatCountDatabase,
    updateSeatListDatabase
};