using DataLayer.Entities;

namespace DataLayer.Repositories.UserRepository;

public interface IUserRepository
{
    public Task InsertAsync(User user);
    
    public Task UpdateAsync(User user);
    
    public Task DeleteAsync(User user);
    
    public Task<User?> GetByIdAsync(int id);
    
    public Task<User?> GetUserByEmailAsync(string email);

    public Task<User?> GetByUsernameAsync(string username);
}