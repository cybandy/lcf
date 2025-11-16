import { faker } from '@faker-js/faker';
import { chunk } from 'es-toolkit';

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed database with test data',
  },
  async run() {
    if (!import.meta.dev) {
      return {
        result: '',
      };
    }
    const db = useDrizzle();

    console.log('🌱 Starting database seed...');

    // Clear existing data (in reverse dependency order)
    await db.delete(tables.timerSegments);
    await db.delete(tables.timers);
    await db.delete(tables.groupInvitations);
    await db.delete(tables.groupApplications);
    await db.delete(tables.notifications);
    await db.delete(tables.images);
    await db.delete(tables.albums);
    await db.delete(tables.eventRsvps);
    await db.delete(tables.attendance);
    await db.delete(tables.posts);
    await db.delete(tables.events);
    await db.delete(tables.userRoles);
    await db.delete(tables.membersToGroups);
    await db.delete(tables.roles);
    await db.delete(tables.groups);
    await db.delete(tables.users);

    console.log('🗑️  Cleared existing data');

    // 1. Create users with password
    const _pwd = await hashPassword('123@Abc');
    const userIds: string[] = [];

    // Create admin user
    const adminUser = {
      id: generateId('user'),
      firstName: 'John',
      lastName: 'Admin',
      email: 'admin@church.com',
      password: _pwd,
      bio: 'Church Administrator and Lead Pastor',
      phoneNumber: faker.phone.number(),
      dob: faker.date.birthdate({ min: 25, max: 65, mode: 'age' }),
      nationality: 'United States',
      status: 'active' as const,
    };
    userIds.push(adminUser.id);

    // Create pastor user
    const pastorUser = {
      id: generateId('user'),
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'pastor@church.com',
      password: _pwd,
      bio: 'Associate Pastor and Youth Leader',
      phoneNumber: faker.phone.number(),
      dob: faker.date.birthdate({ min: 25, max: 55, mode: 'age' }),
      nationality: 'United States',
      status: 'active' as const,
    };
    userIds.push(pastorUser.id);

    // Create regular members
    const regularUsers = Array.from(Array(18).keys()).map(() => {
      const id = generateId('user');
      userIds.push(id);
      return {
        id,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: _pwd,
        bio: faker.person.bio(),
        phoneNumber: faker.phone.number(),
        dob: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
        nationality: faker.location.country(),
        status: faker.helpers.arrayElement([
          'active',
          'inactive',
          'visitor',
        ] as const),
      };
    });

    const allUsers = [adminUser, pastorUser, ...regularUsers];

    // too much data causes errors
    await Promise.all(
      chunk(allUsers, 5).map((x) => {
        return db.insert(tables.users).values(x);
      }),
    );
    // await db.insert(tables.users).values(allUsers);
    // await Promise.all([
    //   await db.insert(tables.users).values(adminUser),
    //   await db.insert(tables.users).values(pastorUser),
    //   await db.insert(tables.users).values(regularUsers),
    // ]);
    console.log(`👥 Created ${allUsers.length} users`);

    // 2. Create roles
    const rolesData = [
      { name: 'Admin', description: 'Full system administration access' },
      { name: 'Pastor', description: 'Pastoral staff with content management' },
      {
        name: 'Editor',
        description: 'Content creation and editing permissions',
      },
      { name: 'Leader', description: 'Group and ministry leadership' },
      { name: 'Member', description: 'Basic member access' },
    ];

    const insertedRoles = await db
      .insert(tables.roles)
      .values(rolesData)
      .returning();
    const roleMap = new Map(insertedRoles.map(r => [r.name, r.id]));
    console.log(`🎭 Created ${insertedRoles.length} roles`);

    // 3. Assign user roles
    const userRolesData = [
      { userId: adminUser.id, roleId: roleMap.get('Admin')! },
      { userId: adminUser.id, roleId: roleMap.get('Pastor')! }, // Admin is also a pastor
      { userId: pastorUser.id, roleId: roleMap.get('Pastor')! },
      { userId: pastorUser.id, roleId: roleMap.get('Editor')! },
      // Assign random roles to some other users
      ...regularUsers.map(x => ({
        userId: x.id,
        roleId: faker.helpers.arrayElement([
          roleMap.get('Editor')!,
          roleMap.get('Leader')!,
          roleMap.get('Member')!,
        ]),
      })),
      // ...userIds.slice(2, 8).map((userId) => ({
      //   userId,
      //   roleId: faker.helpers.arrayElement([
      //     roleMap.get('Editor')!,
      //     roleMap.get('Leader')!,
      //     roleMap.get('Member')!,
      //   ]),
      // })),
    ];
    // too much data causes errors
    await Promise.all(
      chunk(userRolesData, 5).map((x) => {
        return db.insert(tables.userRoles).values(x);
      }),
    );
    // await db.insert(tables.userRoles).values(userRolesData);
    console.log(`🔗 Assigned ${userRolesData.length} user roles`);

    // 4. Create groups
    const groupsData = [
      {
        name: 'Youth Ministry',
        description: 'Ministry for teenagers and young adults',
      },
      {
        name: 'Worship Team',
        description: 'Musicians and singers for Sunday service',
      },
      {
        name: 'Prayer Group',
        description: 'Weekly prayer and intercession meetings',
      },
      {
        name: 'Bible Study',
        description: 'Wednesday evening Bible study group',
      },
      {
        name: 'Outreach Team',
        description: 'Community outreach and evangelism',
      },
      {
        name: "Children's Ministry",
        description: "Sunday school and children's programs",
      },
    ];

    const insertedGroups = await db
      .insert(tables.groups)
      .values(groupsData)
      .returning();
    console.log(`👨‍👩‍👧‍👦 Created ${insertedGroups.length} groups`);

    // 5. Assign members to groups
    const membersToGroupsData: Array<{
      userId: string
      groupId: number
      role: 'leader' | 'member'
    }> = [];
    insertedGroups.forEach((group, index) => {
      // Assign leaders (first 2 users as leaders for some groups)
      if (index < 2 && userIds[index]) {
        membersToGroupsData.push({
          userId: userIds[index]!,
          groupId: group.id,
          role: 'leader' as const,
        });
      }

      // Assign random members to each group
      const memberCount = faker.number.int({ min: 3, max: 8 });
      const groupMembers = faker.helpers.arrayElements(userIds, memberCount);

      groupMembers.forEach((userId) => {
        // Avoid duplicate entries
        if (
          !membersToGroupsData.some(
            m => m.userId === userId && m.groupId === group.id,
          )
        ) {
          membersToGroupsData.push({
            userId,
            groupId: group.id,
            role: 'member' as const,
          });
        }
      });
    });

    // too much data causes errors
    await Promise.all(
      chunk(membersToGroupsData, 7).map((x) => {
        return db.insert(tables.membersToGroups).values(x);
      }),
    );
    // await db.insert(tables.membersToGroups).values(membersToGroupsData);
    console.log(`🤝 Created ${membersToGroupsData.length} group memberships`);

    // 6. Create events
    const eventsData = [];
    const eventIds: number[] = [];

    // Past events
    for (let i = 0; i < 5; i++) {
      const startTime = faker.date.past({ years: 0.5 });
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      eventsData.push({
        title: faker.helpers.arrayElement([
          'Sunday Service',
          'Prayer Meeting',
          'Bible Study',
          'Youth Night',
          'Community Outreach',
        ]),
        description: faker.lorem.paragraph(),
        startTime: startTime,
        endTime: endTime,
        location: faker.helpers.arrayElement([
          'Main Sanctuary',
          'Fellowship Hall',
          'Youth Room',
          'Conference Room',
          'Community Center',
        ]),
        creatorId: faker.helpers.arrayElement([adminUser.id, pastorUser.id]),
      });
    }

    // Future events
    for (let i = 0; i < 8; i++) {
      const startTime = faker.date.future({ years: 0.5 });
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

      eventsData.push({
        title: faker.helpers.arrayElement([
          'Sunday Morning Service',
          'Evening Prayer',
          'Midweek Bible Study',
          'Youth Fellowship',
          'Marriage Seminar',
          'Baptism Service',
          'Christmas Concert',
          'Easter Celebration',
        ]),
        description: faker.lorem.paragraph(),
        startTime: startTime,
        endTime: endTime,
        location: faker.helpers.arrayElement([
          'Main Sanctuary',
          'Fellowship Hall',
          'Youth Room',
          'Outdoor Pavilion',
          'Conference Room',
        ]),
        creatorId: faker.helpers.arrayElement([adminUser.id, pastorUser.id]),
      });
    }

    // too much data causes errors

    const insertedEvents = [] as Array<{
      id: number
      createdAt: Date
      updatedAt: Date
      description: string | null
      title: string
      startTime: Date
      endTime: Date | null
      location: string | null
      creatorId: string | null
    }>;
    await chunk(eventsData, 7).map(async (x) => {
      const e_ids = await db.insert(tables.events).values(x).returning();
      eventIds.push(...e_ids.map(x => x.id));
      insertedEvents.push(...e_ids);
    });

    // const insertedEvents = await db
    //   .insert(tables.events)
    //   .values(eventsData)
    //   .returning();
    // insertedEvents.forEach((e) => eventIds.push(e.id));
    console.log(`📅 Created ${eventsData.length} events`);

    // 7. Create posts (blog/sermons)
    const postsData = Array.from(Array(12).keys()).map(() => {
      const isPublished = faker.datatype.boolean(0.8); // 80% published
      return {
        title: faker.helpers.arrayElement([
          'Finding Hope in Difficult Times',
          'The Power of Prayer',
          'Walking in Faith',
          "God's Love Never Fails",
          'Building Strong Relationships',
          'Serving Others with Joy',
          'The Importance of Community',
          'Living with Purpose',
        ]),
        content: faker.lorem.paragraphs(5, '\n\n'),
        authorId: faker.helpers.arrayElement([adminUser.id, pastorUser.id]),
        status: isPublished
          ? ('published' as const)
          : faker.helpers.arrayElement(['draft', 'archived'] as const),
        publishedAt: isPublished ? faker.date.recent({ days: 30 }) : null,
      };
    });

    await Promise.all(
      chunk(postsData, 5).map(x => db.insert(tables.posts).values(x)),
    );
    // await db.insert(tables.posts).values(postsData);
    console.log(`📝 Created ${postsData.length} posts`);

    // 8. Create event RSVPs
    const rsvpData: Array<{
      userId: string
      eventId: number
      status: 'attending' | 'not_attending' | 'maybe'
      guestCount: number
    }> = [];
    insertedEvents.forEach((event) => {
      // Random subset of users RSVP to each event
      const rsvpCount = faker.number.int({ min: 5, max: 12 });
      const rsvpUsers = faker.helpers.arrayElements(userIds, rsvpCount);

      rsvpUsers.forEach((userId) => {
        rsvpData.push({
          userId,
          eventId: event.id,
          status: faker.helpers.arrayElement([
            'attending',
            'not_attending',
            'maybe',
          ] as const),
          guestCount: faker.number.int({ min: 0, max: 3 }),
        });
      });
    });

    await Promise.all(
      chunk(rsvpData, 5).map(x => db.insert(tables.eventRsvps).values(x)),
    );
    // await db.insert(tables.eventRsvps).values(rsvpData);
    console.log(`✅ Created ${rsvpData.length} event RSVPs`);

    // 9. Create attendance records for past events
    const attendanceData: Array<{
      userId: string
      eventId: number
      checkInTime: Date
    }> = [];
    const pastEvents = insertedEvents.filter(
      e => e.startTime.getTime() < Date.now(),
    );

    pastEvents.forEach((event) => {
      const attendeeCount = faker.number.int({ min: 8, max: 15 });
      const attendees = faker.helpers.arrayElements(userIds, attendeeCount);

      attendees.forEach((userId) => {
        const eventStartTime = event.startTime.getTime();
        attendanceData.push({
          userId,
          eventId: event.id,
          checkInTime: faker.date.between({
            from: new Date(eventStartTime),
            to: new Date(eventStartTime + 30 * 60 * 1000), // 30 min window
          }),
        });
      });
    });

    await Promise.all(
      chunk(attendanceData, 5).map(x =>
        db.insert(tables.attendance).values(x),
      ),
    );
    // await db.insert(tables.attendance).values(attendanceData);
    console.log(`👥 Created ${attendanceData.length} attendance records`);

    // 10. Create albums and images
    const albumsData = [
      {
        title: 'Sunday Services',
        description: 'Photos from our weekly worship services',
        creatorId: adminUser.id,
      },
      {
        title: 'Youth Events',
        description: 'Youth ministry activities and camps',
        creatorId: pastorUser.id,
      },
      {
        title: 'Community Outreach',
        description: 'Serving our local community',
        creatorId: adminUser.id,
      },
      {
        title: 'Church Fellowship',
        description: 'Fellowship meals and social events',
        creatorId: pastorUser.id,
      },
    ];

    const insertedAlbums = await db
      .insert(tables.albums)
      .values(albumsData)
      .returning();
    console.log(`📸 Created ${insertedAlbums.length} albums`);

    // Create images for albums
    const imagesData: Array<{
      albumId: number
      uploaderId: string
      url: string
      caption: string
    }> = [];
    insertedAlbums.forEach((album) => {
      const imageCount = faker.number.int({ min: 3, max: 8 });
      for (let i = 0; i < imageCount; i++) {
        imagesData.push({
          albumId: album.id,
          uploaderId: faker.helpers.arrayElement(userIds),
          url: faker.image.url({ width: 800, height: 600 }),
          caption: faker.lorem.sentence(),
        });
      }
    });

    await Promise.all(
      chunk(imagesData, 5).map(x => db.insert(tables.images).values(x)),
    );
    // await db.insert(tables.images).values(imagesData);
    console.log(`🖼️  Created ${imagesData.length} images`);

    // 11. Create timers for future events
    const timersData: Array<{
      id: string
      label: string
      totalDuration: number
      eventId: number
      speakerId: string
      organizerId: string
    }> = [];
    const timerIds: string[] = [];
    const futureEvents = insertedEvents
      .filter(e => e.startTime.getTime() > Date.now())
      .slice(0, 4);

    futureEvents.forEach((event) => {
      const timerId = generateId('timer');
      timerIds.push(timerId);
      timersData.push({
        id: timerId,
        label: `${event.title} - Main Speaker`,
        totalDuration: 30 * 60, // 30 minutes
        eventId: event.id,
        speakerId: faker.helpers.arrayElement([adminUser.id, pastorUser.id]),
        organizerId: adminUser.id,
      });
    });

    await Promise.all(
      chunk(timersData, 5).map(x => db.insert(tables.timers).values(x)),
    );
    // await db.insert(tables.timers).values(timersData);
    console.log(`⏱️  Created ${timersData.length} timers`);

    // 12. Create timer segments
    const segmentsData: Array<{
      timerId: string
      label: string
      duration: number
      order: number
    }> = [];
    timerIds.forEach((timerId) => {
      const segments = [
        { label: 'Opening Prayer', duration: 3 * 60, order: 1 },
        { label: 'Scripture Reading', duration: 5 * 60, order: 2 },
        { label: 'Main Message', duration: 20 * 60, order: 3 },
        { label: 'Closing Prayer', duration: 2 * 60, order: 4 },
      ];

      segments.forEach((segment) => {
        segmentsData.push({
          timerId,
          ...segment,
        });
      });
    });

    await Promise.all(
      chunk(segmentsData, 5).map(x =>
        db.insert(tables.timerSegments).values(x),
      ),
    );
    // await db.insert(tables.timerSegments).values(segmentsData);
    console.log(`🕐 Created ${segmentsData.length} timer segments`);

    // 13. Create group applications
    const applicationsData: Array<{
      userId: string
      groupId: number
      status: 'pending' | 'approved' | 'rejected'
      reviewedById?: string | null
      reviewedAt?: Date | null
    }> = [];
    const nonMemberUsers = userIds
      .filter(userId => !membersToGroupsData.some(m => m.userId === userId))
      .slice(0, 5);

    nonMemberUsers.forEach((userId) => {
      const groupId = faker.helpers.arrayElement(insertedGroups).id;
      const hasReview = faker.datatype.boolean(0.7);
      applicationsData.push({
        userId,
        groupId,
        status: faker.helpers.arrayElement([
          'pending',
          'approved',
          'rejected',
        ] as const),
        reviewedById: hasReview ? adminUser.id : null,
        reviewedAt: hasReview ? faker.date.recent({ days: 7 }) : null,
      });
    });

    await Promise.all(
      chunk(applicationsData, 5).map(x =>
        db.insert(tables.groupApplications).values(x),
      ),
    );
    // await db.insert(tables.groupApplications).values(applicationsData);
    console.log(`📋 Created ${applicationsData.length} group applications`);

    // 14. Create group invitations
    const invitationsData: Array<{
      groupId: number
      invitedUserId: string
      inviterUserId: string
      status: 'pending' | 'accepted' | 'declined'
    }> = [];
    const uninvitedUsers = userIds.slice(-5); // Last 5 users

    uninvitedUsers.forEach((userId) => {
      const groupId = faker.helpers.arrayElement(insertedGroups).id;
      invitationsData.push({
        groupId,
        invitedUserId: userId,
        inviterUserId: faker.helpers.arrayElement([
          adminUser.id,
          pastorUser.id,
        ]),
        status: faker.helpers.arrayElement([
          'pending',
          'accepted',
          'declined',
        ] as const),
      });
    });

    await Promise.all(
      chunk(invitationsData, 5).map(x =>
        db.insert(tables.groupInvitations).values(x),
      ),
    );
    // await db.insert(tables.groupInvitations).values(invitationsData);
    console.log(`💌 Created ${invitationsData.length} group invitations`);

    // 15. Create notifications
    const notificationsData: Array<{
      userId: string
      message: string
      link?: string | null
      isRead: boolean
    }> = [];
    userIds.forEach((userId) => {
      const notificationCount = faker.number.int({ min: 1, max: 5 });
      for (let i = 0; i < notificationCount; i++) {
        notificationsData.push({
          userId,
          message: faker.helpers.arrayElement([
            'Welcome to our church community!',
            'You have been assigned to a new group',
            'New event: Sunday Morning Service',
            'Your RSVP has been confirmed',
            'New message from your group leader',
            "Don't forget about tonight's Bible study",
          ]),
          link: faker.helpers.arrayElement([
            '/events',
            '/groups',
            '/profile',
            null,
          ]),
          isRead: faker.datatype.boolean(0.6), // 60% read
        });
      }
    });

    await Promise.all(
      chunk(notificationsData, 5).map(x =>
        db.insert(tables.notifications).values(x),
      ),
    );
    // await db.insert(tables.notifications).values(notificationsData);
    console.log(`🔔 Created ${notificationsData.length} notifications`);

    console.log('✅ Database seeding completed successfully!');

    return {
      result: 'Success',
      summary: {
        users: allUsers.length,
        roles: insertedRoles.length,
        groups: insertedGroups.length,
        events: insertedEvents.length,
        posts: postsData.length,
        albums: insertedAlbums.length,
        images: imagesData.length,
        timers: timersData.length,
        notifications: notificationsData.length,
      },
    };
  },
});
