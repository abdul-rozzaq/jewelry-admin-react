import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "@/src/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useGetUsersQuery, useAddUsersMutation, useUpdateUserMutation, useDeleteUserMutation, UsersApi } from "@/src/lib/service/usersApi";
import { useGetOrganizationsQuery } from "@/src/lib/service/organizationsApi";

import { useDispatch } from "react-redux";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/src/components/ui/table";
import type { User } from "@/src/types/user";
import type Organization from "@/src/types/organization";
import { useTranslation } from "react-i18next";

export default function UsersPage() {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const { data: users = [], isLoading: usersLoading, error: usersError } = useGetUsersQuery(undefined);
  const { data: organizations = [], isLoading: orgsLoading } = useGetOrganizationsQuery({});

  const [addUser] = useAddUsersMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "",
    organization: "",
  });

  // const getOrganizationInfo = (orgId: number) => {
  //   const org = organizations.find((o: Organization) => o.id === orgId)
  //   if (org && org.name && org.type) {
  //     return `${org.name} (${org.type})`
  //   }
  //   return t('UsersPage.form.organizationPrefix') + ` #${orgId}`
  // }

  const filteredUsers = users.filter(
    (user: User) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.organization.name} (${user.organization.type})`.includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "",
      organization: "",
    });
  };

  const handleCreateUser = async () => {
    // Validate required fields
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.organization) {
      toast({
        title: t("UsersPage.errors.title"),
        description: t("UsersPage.errors.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("UsersPage.errors.title"),
        description: t("UsersPage.errors.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    // Check if username already exists
    if (users.some((user: User) => user.username === formData.username)) {
      toast({
        title: t("UsersPage.errors.title"),
        description: t("UsersPage.errors.usernameExists"),
        variant: "destructive",
      });
      return;
    }

    const apiData = {
      username: formData.username,
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName || "",
      password: formData.password,
      organization: Number.parseInt(formData.organization),
    };

    try {
      await addUser(apiData).unwrap();
      resetForm();
      setIsCreateDialogOpen(false);

      toast({
        title: t("UsersPage.success.title"),
        description: t("UsersPage.success.userCreated"),
      });
      dispatch(UsersApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("UsersPage.errors.title"),
        description: t("UsersPage.errors.createUserFailed"),
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      firstName: user.first_name,
      lastName: user.last_name || "",
      role: "", // Role is not in the API response, so we leave it empty
      organization: user.organization.toString(),
    });
    setIsEditDialogOpen(true);
    dispatch(UsersApi.util.resetApiState());
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Validate required fields
    if (!formData.username || !formData.email || !formData.firstName || !formData.organization) {
      toast({
        title: t("UsersPage.errors.title"),
        description: t("UsersPage.errors.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    // Validate password confirmation if password is provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: t("UsersPage.errors.title"),
        description: t("UsersPage.errors.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    const apiData: any = {
      username: formData.username,
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName || "",
      organization: Number.parseInt(formData.organization),
    };

    // Only include password if it's provided
    if (formData.password) {
      apiData.password = formData.password;
    }

    try {
      await updateUser({ id: selectedUser.id, ...apiData }).unwrap();
      resetForm();
      setIsEditDialogOpen(false);
      setSelectedUser(null);

      toast({
        title: t("UsersPage.success.title"),
        description: t("UsersPage.success.userUpdated"),
      });
      dispatch(UsersApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("UsersPage.errors.title"),
        description: t("UsersPage.errors.updateUserFailed"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      dispatch(UsersApi.util.resetApiState());
      toast({
        title: t("UsersPage.success.title"),
        description: t("UsersPage.success.userDeleted"),
      });
      dispatch(UsersApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("UsersPage.errors.title"),
        description: t("UsersPage.errors.deleteUserFailed"),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const toggleUserStatus = async (userId: number) => {
    const user = users.find((u: User) => u.id === userId);
    if (!user) return;

    try {
      await updateUser({
        id: userId,
        is_active: !user.is_active,
      }).unwrap();

      toast({
        title: t("UsersPage.success.title"),
        description: t("UsersPage.success.statusChanged"),
      });
      dispatch(UsersApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("UsersPage.errors.title"),
        description: t("UsersPage.errors.statusChangeFailed"),
        variant: "destructive",
      });
    }
  };

  if (usersLoading || orgsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t("UsersPage.loading.text")}</span>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">{t("UsersPage.errors.loadUsersFailed")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("UsersPage.header.title")}</h1>
          <p className="text-muted-foreground">{t("UsersPage.header.description")}</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-0.5" />
              {t("UsersPage.buttons.newUser")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("UsersPage.dialogs.create.title")}</DialogTitle>
              <DialogDescription>{t("UsersPage.dialogs.create.description")}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">{t("UsersPage.form.firstName")} *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder={t("UsersPage.form.firstNamePlaceholder")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastName">{t("UsersPage.form.lastName")}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder={t("UsersPage.form.lastNamePlaceholder")}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="organization">{t("UsersPage.form.organization")} *</Label>
                <Select value={formData.organization} onValueChange={(value) => setFormData({ ...formData, organization: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("UsersPage.form.organizationPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org: Organization) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name && org.type ? `${org.name} (${org.type})` : `${t("UsersPage.form.organizationPrefix")} #${org.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">{t("UsersPage.form.username")} *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder={t("UsersPage.form.usernamePlaceholder")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">{t("UsersPage.form.email")} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t("UsersPage.form.emailPlaceholder")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">{t("UsersPage.form.password")} *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t("UsersPage.form.passwordPlaceholder")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t("UsersPage.form.confirmPassword")} *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder={t("UsersPage.form.confirmPasswordPlaceholder")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Faol (is_active)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isStaff"
                    checked={formData.isStaff}
                    onChange={(e) => setFormData({ ...formData, isStaff: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="isStaff" className="text-sm font-medium">
                    Xodim (is_staff)
                  </Label>
                </div>
              </div> */}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                {t("UsersPage.buttons.cancel")}
              </Button>
              <Button onClick={handleCreateUser}>{t("UsersPage.buttons.create")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("UsersPage.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("UsersPage.table.title")}</CardTitle>
          <CardDescription>{t("UsersPage.table.description", { count: filteredUsers.length })}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t("UsersPage.table.headers.user")}</TableHead>
                <TableHead>{t("UsersPage.table.headers.email")}</TableHead>
                <TableHead>{t("UsersPage.table.headers.organization")}</TableHead>
                <TableHead>{t("UsersPage.table.headers.status")}</TableHead>
                <TableHead className="text-right">{t("UsersPage.table.headers.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: User, index: number) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name} <br />
                    <span className="text-muted-foreground text-sm">@{user.username}</span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{`${user.organization.name} (${user.organization.type})`}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? t("UsersPage.status.active") : t("UsersPage.status.inactive")}
                      </Badge>
                      {user.is_staff && <Badge variant="outline">{t("UsersPage.status.staff")}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-0.5" />
                          {t("UsersPage.actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                          {user.is_active ? t("UsersPage.actions.deactivate") : t("UsersPage.actions.activate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(user)}>
                          <Trash2 className="h-4 w-4 mr-0.5" />
                          {t("UsersPage.actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("UsersPage.dialogs.edit.title")}</DialogTitle>
            <DialogDescription>{t("UsersPage.dialogs.edit.description")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Same form fields as create dialog */}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">{t("UsersPage.form.firstName")} *</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder={t("UsersPage.form.firstNamePlaceholder")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">{t("UsersPage.form.lastName")}</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder={t("UsersPage.form.lastNamePlaceholder")}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-organization">{t("UsersPage.form.organization")} *</Label>
              <Select value={formData.organization} onValueChange={(value) => setFormData({ ...formData, organization: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("UsersPage.form.organizationPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org: Organization) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name && org.type ? `${org.name} (${org.type})` : `${t("UsersPage.form.organizationPrefix")} #${org.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-username">{t("UsersPage.form.username")} *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t("UsersPage.form.usernamePlaceholder")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">{t("UsersPage.form.email")} *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("UsersPage.form.emailPlaceholder")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-password">{t("UsersPage.form.newPassword")}</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t("UsersPage.form.newPasswordPlaceholder")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {formData.password && (
              <div className="grid gap-2">
                <Label htmlFor="edit-confirmPassword">{t("UsersPage.form.confirmPassword")} *</Label>
                <div className="relative">
                  <Input
                    id="edit-confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder={t("UsersPage.form.confirmPasswordPlaceholder")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedUser(null);
              }}
            >
              {t("UsersPage.buttons.cancel")}
            </Button>
            <Button onClick={handleUpdateUser}>{t("UsersPage.buttons.update")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("UsersPage.dialogs.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("UsersPage.dialogs.delete.description", {
                name: `${selectedUser?.first_name} ${selectedUser?.last_name}`,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("UsersPage.buttons.no")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedUser && handleDeleteUser(selectedUser.id)} className="bg-red-600 hover:bg-red-700">
              {t("UsersPage.buttons.yesDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
