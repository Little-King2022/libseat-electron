// 从图书馆服务器拉取座位菜单数据，并更新本地 sqlite 数据库中的 floor_info 和 room_info 表
const axios = require('axios');
const dbService = require('../database/sqlite');

const SEAT_MENU_URL = 'https://libseat.njfu.edu.cn/ic-web/seatMenu';

async function updateSeatMenuDatabase() {
    try {
        const response = await axios.get(SEAT_MENU_URL);
        const seatData = response.data;

        if (seatData.code !== 0 || !Array.isArray(seatData.data)) {
            throw new Error('无效的seatMenu响应数据');
        }

        const floors = seatData.data;

        // 清空原有数据
        await dbService.run('DELETE FROM room_info');
        await dbService.run('DELETE FROM floor_info');

        for (const floor of floors) {
            const { id: floor_id, name: floor_name, remainCount, totalCount, children } = floor;

            // 插入楼层信息
            await dbService.run(
                `INSERT INTO floor_info (floor_id, floor_name, remain_count, total_count)
                 VALUES (?, ?, ?, ?)`,
                [floor_id.toString(), floor_name, remainCount, totalCount]
            );

            // 插入房间信息
            for (const room of children || []) {
                const { id: room_id, name: room_name, remainCount, totalCount } = room;

                await dbService.run(
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
            await dbService.run(
                `UPDATE floor_info 
                 SET remain_count = ?, total_count = ?
                 WHERE floor_id = ?`,
                [remainCount, totalCount, floor_id.toString()]
            );

            // 更新房间座位数量
            for (const room of children || []) {
                const { id: room_id, remainCount, totalCount } = room;

                await dbService.run(
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

module.exports = {
    updateSeatMenuDatabase,
    updateSeatCountDatabase
};