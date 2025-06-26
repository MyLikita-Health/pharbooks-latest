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
  getAppointments: (params?: any) => apiClient.get(`/appointments?${new URLSearchParams(params)}`),
  bookAppointment: (data: any) => apiClient.post("/appointments", data),
  updateAppointmentStatus: (id: string, data: any) => apiClient.patch(`/appointments/${id}/status`, data),
}

export const prescriptionsApi = {
  getPrescriptions: (params?: any) => apiClient.get(`/prescriptions?${new URLSearchParams(params)}`),
  createPrescription: (data: any) => apiClient.post("/prescriptions", data),
  updatePrescriptionStatus: (id: string, data: any) => apiClient.patch(`/prescriptions/${id}/status`, data),
}

export const usersApi = {
  getProfile: () => apiClient.get("/users/profile"),
  updateProfile: (data: any) => apiClient.put("/users/profile", data),
  getDoctors: (params?: any) => apiClient.get(`/users/doctors?${new URLSearchParams(params)}`),
  getUsers: (params?: any) => apiClient.get(`/users?${new URLSearchParams(params)}`),
  approveUser: (id: string, data: any) => apiClient.patch(`/users/${id}/approval`, data),
}

export const pharmacyApi = {
  getOrders: (params?: any) => apiClient.get(`/pharmacy/orders?${new URLSearchParams(params)}`),
  createOrder: (data: any) => apiClient.post("/pharmacy/orders", data),
  updateOrderStatus: (id: string, data: any) => apiClient.patch(`/pharmacy/orders/${id}/status`, data),
}

export const notificationsApi = {
  getNotifications: (params?: any) => apiClient.get(`/notifications?${new URLSearchParams(params)}`),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
  markAllAsRead: () => apiClient.patch("/notifications/read-all", {}),
}
