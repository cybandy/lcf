import { FellowshipPermission } from '#layers/backend/shared/utils/authorization';

export type GroupMemberUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  status: string | null
}
export type GroupMember = {
  user: GroupMemberUser
  role: 'leader' | 'member'
}
export type GroupBasic = {
  id: number
  name: string
  description: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}
export type GroupWithMembers = GroupBasic & {
  members: GroupMember[]
}

export function useGroups() {
  const toast = useToast();
  const permissions = usePermissions();

  const loading = ref(false);
  const creating = ref(false);
  const groups = ref<GroupWithMembers[] | GroupBasic[]>([]);
  const currentGroup = ref<GroupWithMembers | null>(null);

  const canCreateGroups = computed(() => permissions.can(FellowshipPermission.CREATE_GROUPS));

  async function fetchPublicGroups() {
    loading.value = true;
    try {
      const res = await $fetch<{ groups: GroupBasic[] }>('/api/public/groups');
      groups.value = res.groups;
      return res.groups;
    } catch (e) {
      toast.add({ title: 'Error', description: 'Failed to load groups', color: 'error' });
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAuthorizedGroups() {
    loading.value = true;
    try {
      const res = await $fetch<{ groups: GroupWithMembers[] }>('/api/group/with-members');
      groups.value = res.groups;
      return res.groups;
    } catch (e) {
      toast.add({ title: 'Error', description: 'Failed to load your groups', color: 'error' });
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAuthGroup(id: number) {
    loading.value = true;
    try {
      const res = await $fetch<{ group: GroupWithMembers }>(`/api/group/with-members/${id}`);
      currentGroup.value = res.group;
      return res.group;
    } catch (e) {
      toast.add({ title: 'Error', description: 'Failed to load group', color: 'error' });
      throw e;
    } finally {
      loading.value = false;
    }
  }
  async function fetchGroup(id: number) {
    loading.value = true;
    try {
      const res = await $fetch<{ group: GroupWithMembers }>(`/api/public/groups/${id}`);
      currentGroup.value = res.group;
      return res.group;
    } catch (e) {
      toast.add({ title: 'Error', description: 'Failed to load group', color: 'error' });
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createGroup(data: { name: string, description?: string }) {
    if (!canCreateGroups.value) {
      toast.add({ title: 'Unauthorized', description: 'You cannot create groups', color: 'error' });
      return null;
    }
    creating.value = true;
    try {
      const res = await $fetch<{ group: GroupBasic }>(`/api/group`, { method: 'POST', body: data });
      toast.add({ title: 'Group created', description: 'Group was created successfully', color: 'success' });
      // Optionally push to groups list if already fetched
      if (Array.isArray(groups.value)) {
        groups.value = [...groups.value, res.group];
      }
      return res.group;
    } catch (e) {
      toast.add({ title: 'Error', description: 'Failed to create group', color: 'error' });
      throw e;
    } finally {
      creating.value = false;
    }
  }

  return {
    // state
    loading,
    creating,
    groups,
    currentGroup,
    // permissions
    canCreateGroups,
    // actions
    fetchPublicGroups,
    fetchAuthorizedGroups,
    fetchGroup,
    fetchAuthGroup,
    createGroup,
  };
}
