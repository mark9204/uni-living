using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniLiving.DataContext.Entities
{
    public class AbstractEntity
    {
        public int Id { get; set; }
        public bool IsDeleted { get; set; }
    }
}
