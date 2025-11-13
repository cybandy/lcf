import { useValidatedQuery, z, zh } from 'h3-zod'
export default defineEventHandler(async (event) => {
  const {id, user_id, } = await useValidatedQuery(event, z.object({
    id: zh.intAsString,
    user_id: z.string().optional(),
    // email: z.email().optional()
  }))

 

  await myRequireUserSession(event)

  const db = useDrizzle()


  // Get all attendance records with user details
    let attendanceList = await db
      .select({
        userId: tables.attendance.userId,
        checkInTime: tables.attendance.checkInTime,
        user: {
          id: tables.users.id,
          firstName: tables.users.firstName,
          lastName: tables.users.lastName,
          email: tables.users.email,
          avatar: tables.users.avatar,
          status: tables.users.status,
        },
      })
      .from(tables.attendance)
      .leftJoin(tables.users, eq(tables.attendance.userId, tables.users.id))
      .where(
        and(
          eq(tables.attendance.eventId, parseInt(id)),
          eq(tables.attendance.userId, user_id)
        )
      )
      .orderBy(desc(tables.attendance.checkInTime))
      .all()

  if (attendanceList && attendanceList.length) {
    attendanceList = attendanceList.map(x => ({
      ...x,
      user: x.user ? {
        ...x.user,
        avatar: x.user.avatar ? `/files/${x.user.avatar}` : null
      }: null
    }))
    return {
      status: true,
      data:  attendanceList[0]!
    }
  } else {
    return {
      status: false
    }
  }
})
