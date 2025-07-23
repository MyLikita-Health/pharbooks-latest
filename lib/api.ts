const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Cookie utility function for API client
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null

  const nameEQ = name + "="
  const ca = document.cookie.split(";")

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

class ApiClient {
  private getAuthHeaders() {
    const token = getCookie("medilinka_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  async delete(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()

// Specific API functions
export const appointmentsApi = {
  getAppointments: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/appointments${queryString}`)
  },
  bookAppointment: (data: any) => apiClient.post("/appointments", data),
  updateAppointmentStatus: (id: string, data: any) => apiClient.patch(`/appointments/${id}/status`, data),
  getAppointmentById: (id: string) => apiClient.get(`/appointments/${id}`),
  createAppointment: (data: any) => apiClient.post("/appointments/doctor-create", data),
  updateAppointment: (id: string, data: any) => apiClient.patch(`/appointments/${id}`, data),
  getMeetingDetails: (id: string) => apiClient.get(`/appointments/${id}/meeting`),
}

export const prescriptionsApi = {
  getPrescriptions: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/prescriptions${queryString}`)
  },
  createPrescription: (data: any) => apiClient.post("/prescriptions", data),
  updatePrescriptionStatus: (id: string, data: any) => apiClient.patch(`/prescriptions/${id}/status`, data),
  getPrescriptionById: (id: string) => apiClient.get(`/prescriptions/${id}`),
}

export const usersApi = {
  getProfile: () => apiClient.get("/users/profile"),
  updateProfile: (data: any) => apiClient.put("/users/profile", data),
  getDoctors: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/users/doctors${queryString}`)
  },
  getUsers: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/users${queryString}`)
  },
  getUserById: (id: string) => apiClient.get(`/users/${id}`),
  approveUser: (id: string, data: any) => apiClient.patch(`/users/${id}/approval`, data),
  createUser: (data: any) => apiClient.post("/users", data),
  updateUser: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),
}

export const dashboardApi = {
  getDoctorStats: () => apiClient.get("/dashboard/doctor/stats"),
  getPatientStats: () => apiClient.get("/dashboard/patient/stats"),
  getAdminStats: () => apiClient.get("/dashboard/admin/stats"),
  getPharmacistStats: () => apiClient.get("/dashboard/pharmacist/stats"),
  getHubStats: () => apiClient.get("/dashboard/hub/stats"),
}

export const pharmacyApi = {
  getOrders: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/pharmacy/orders${queryString}`)
  },
  createOrder: (data: any) => apiClient.post("/pharmacy/orders", data),
  updateOrderStatus: (id: string, data: any) => apiClient.patch(`/pharmacy/orders/${id}/status`, data),
  getOrderById: (id: string) => apiClient.get(`/pharmacy/orders/${id}`),
  getInventory: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/pharmacy/inventory${queryString}`)
  },
  updateInventory: (id: string, data: any) => apiClient.patch(`/pharmacy/inventory/${id}`, data),
}

export const notificationsApi = {
  getNotifications: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/notifications${queryString}`)
  },
  createNotification: (data: any) => apiClient.post("/notifications", data),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
  markAllAsRead: () => apiClient.patch("/notifications/read-all", {}),
  deleteNotification: (id: string) => apiClient.delete(`/notifications/${id}`),
}

export const investigationsApi = {
  getInvestigations: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/investigations${queryString}`)
  },
  createInvestigation: (data: any) => apiClient.post("/investigations", data),
  updateInvestigationStatus: (id: string, data: any) => apiClient.patch(`/investigations/${id}/status`, data),
  getInvestigationById: (id: string) => apiClient.get(`/investigations/${id}`),
}

export const messagesApi = {
  getMessages: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/messages${queryString}`)
  },
  sendMessage: (data: any) => apiClient.post("/messages", data),
  markMessageAsRead: (id: string) => apiClient.patch(`/messages/${id}/read`, {}),
  getConversation: (userId: string) => apiClient.get(`/messages/conversation/${userId}`),
}

export const reportsApi = {
  getReports: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return apiClient.get(`/reports${queryString}`)
  },
  generateReport: (data: any) => apiClient.post("/reports/generate", data),
  getReportById: (id: string) => apiClient.get(`/reports/${id}`),
}
