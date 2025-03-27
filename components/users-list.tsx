"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Search } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface User {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	avatar: string;
}

interface ApiResponse {
	page: number;
	per_page: number;
	total: number;
	total_pages: number;
	data: User[];
}

export default function UsersList() {
	const [users, setUsers] = useState<User[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

	// Edit user state
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [editFormData, setEditFormData] = useState({
		first_name: "",
		last_name: "",
		email: "",
	});

	// Delete user state
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<number | null>(null);

	const { toast } = useToast();

	useEffect(() => {
		const fetchUsers = async (page: number) => {
			setIsLoading(true);
			setError("");

			try {
				const response = await fetch(
					`https://reqres.in/api/users?page=${page}`,
				);

				if (!response.ok) {
					throw new Error("Failed to fetch users");
				}

				const data: ApiResponse = await response.json();

				setUsers(data.data);
				setFilteredUsers(data.data);
				setTotalPages(data.total_pages);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unknown error occurred",
				);
				toast({
					title: "Error",
					description:
						err instanceof Error ? err.message : "Failed to fetch users",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchUsers(currentPage);
	}, [currentPage, toast]);

	useEffect(() => {
		if (users.length > 0) {
			const filtered = users.filter(
				(user) =>
					user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					user.email.toLowerCase().includes(searchTerm.toLowerCase()),
			);
			setFilteredUsers(filtered);
		}
	}, [searchTerm, users]);

	const handleEditUser = (user: User) => {
		setCurrentUser(user);
		setEditFormData({
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdateUser = async () => {
		if (!currentUser) return;

		try {
			const response = await fetch(
				`https://reqres.in/api/users/${currentUser.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify(editFormData),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to update user");
			}

			// Update user in the local state
			const updatedUsers = users.map((user) =>
				user.id === currentUser.id ? { ...user, ...editFormData } : user,
			);

			setUsers(updatedUsers);
			setFilteredUsers(
				filteredUsers.map((user) =>
					user.id === currentUser.id ? { ...user, ...editFormData } : user,
				),
			);

			toast({
				title: "Success",
				description: "User updated successfully",
			});

			setIsEditDialogOpen(false);
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to update user",
				variant: "destructive",
			});
		}
	};

	const handleDeleteClick = (userId: number) => {
		setUserToDelete(userId);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;

		try {
			const response = await fetch(
				`https://reqres.in/api/users/${userToDelete}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);

			if (!response.ok && response.status !== 204) {
				throw new Error("Failed to delete user");
			}

			// Remove user from the local state
			const updatedUsers = users.filter((user) => user.id !== userToDelete);
			setUsers(updatedUsers);
			setFilteredUsers(
				filteredUsers.filter((user) => user.id !== userToDelete),
			);

			toast({
				title: "Success",
				description: "User deleted successfully",
			});

			setIsDeleteDialogOpen(false);
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to delete user",
				variant: "destructive",
			});
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setEditFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<div className="space-y-6">
			<Toaster />

			{/* Search bar */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search users..."
					className="pl-10"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{isLoading ? (
				<div className="flex justify-center p-8">
					<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
				</div>
			) : error ? (
				<Card>
					<CardContent className="p-6 text-center text-red-500">
						{error}
					</CardContent>
				</Card>
			) : (
				<>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Avatar</TableHead>
									<TableHead>First Name</TableHead>
									<TableHead>Last Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-8">
											No users found
										</TableCell>
									</TableRow>
								) : (
									filteredUsers.map((user) => (
										<TableRow key={user.id}>
											<TableCell>
												<Image
													src={user.avatar || "/placeholder.svg"}
													alt={`${user.first_name} ${user.last_name}`}
													width={40}
													height={40}
													className="rounded-full"
												/>
											</TableCell>
											<TableCell>{user.first_name}</TableCell>
											<TableCell>{user.last_name}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="icon"
														onClick={() => handleEditUser(user)}
													>
														<Pencil className="h-4 w-4" />
														<span className="sr-only">Edit</span>
													</Button>
													<Button
														variant="outline"
														size="icon"
														className="text-red-500 hover:text-red-600"
														onClick={() => handleDeleteClick(user.id)}
													>
														<Trash2 className="h-4 w-4" />
														<span className="sr-only">Delete</span>
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() =>
										setCurrentPage((prev) => Math.max(prev - 1, 1))
									}
									disabled={currentPage === 1}
								/>
							</PaginationItem>

							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => (
									<PaginationItem key={page}>
										<PaginationLink
											onClick={() => setCurrentPage(page)}
											isActive={currentPage === page}
										>
											{page}
										</PaginationLink>
									</PaginationItem>
								),
							)}

							<PaginationItem>
								<PaginationNext
									onClick={() =>
										setCurrentPage((prev) => Math.min(prev + 1, totalPages))
									}
									disabled={currentPage === totalPages}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</>
			)}

			{/* Edit User Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Make changes to the user information below.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="first_name">First Name</Label>
							<Input
								id="first_name"
								name="first_name"
								value={editFormData.first_name}
								onChange={handleInputChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="last_name">Last Name</Label>
							<Input
								id="last_name"
								name="last_name"
								value={editFormData.last_name}
								onChange={handleInputChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={editFormData.email}
								onChange={handleInputChange}
							/>
						</div>
					</div>
					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => setIsEditDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleUpdateUser}>Save Changes</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							user and remove their data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteUser}
							className="bg-red-500 hover:bg-red-600"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
