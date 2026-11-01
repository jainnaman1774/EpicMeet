import React from 'react'
export const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
    }, [])


    const login = async(email,password) => {
      try{
        const {data} = await api.post('/auth/login', {email,password})
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        return data
      }catch(err){
        console.error('Login failed:', err)
        throw err
      }
    }

    const register = async(name,email,password) => {
      try{
        const {data} = await api.post('/auth/register', {name,email,password})
        setUser(data)
        return data
        }catch(err){
            console.error('Registration failed:', err)
            throw err
        }
    }


    const verifyOtp = async() => {
      try{
        const {data} = await api.post('/auth/verify-otp')
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        return data
      }catch(err){
        console.error('OTP verification failed:', err)
        throw err
      }}

      const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }

    return (
      <AuthContext.Provider value={{ user, loading, login, logout, verifyOtp, register }}>
        {children}
        </AuthContext.Provider>
    )
}